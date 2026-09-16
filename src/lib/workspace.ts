import { getAccessToken } from './firebase';

/**
 * Upload a file directly to the user's Google Drive via the official REST API v3
 * using the scoped OAuth Bearer Token.
 */
export async function uploadFileToDrive(file: File, description?: string): Promise<{ fileId: string; webViewLink: string; name: string }> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Google Drive access token missing. Please sign in with Google with Drive permissions.');
  }

  // Use multipart upload to send metadata + file content in one request
  const metadata = {
    name: `[COAB Deliverable] ${file.name}`,
    mimeType: file.type || 'application/octet-stream',
    description: description || 'Deliverable uploaded from COAB Media Tracker',
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Drive upload failed:', response.status, errText);
    throw new Error(`Google Drive upload failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return {
    fileId: data.id,
    webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
    name: data.name,
  };
}

/**
 * Create or sync an event to the primary Google Calendar
 */
export async function createGoogleCalendarEvent(eventData: {
  summary: string;
  description: string;
  startDateTime: string; // ISO string
  endDateTime: string;   // ISO string
  attendeeEmails?: string[];
}): Promise<{ eventId: string; htmlLink: string }> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Google Calendar access token missing. Please sign in with Google with Calendar permissions.');
  }

  const payload: any = {
    summary: eventData.summary,
    description: eventData.description,
    start: {
      dateTime: eventData.startDateTime.includes('T') ? eventData.startDateTime : `${eventData.startDateTime}T09:00:00Z`,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Manila',
    },
    end: {
      dateTime: eventData.endDateTime.includes('T') ? eventData.endDateTime : `${eventData.endDateTime}T17:00:00Z`,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Manila',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 60 },      // 1 hour before
      ],
    },
  };

  if (eventData.attendeeEmails && eventData.attendeeEmails.length > 0) {
    payload.attendees = eventData.attendeeEmails.map((email) => ({ email }));
  }

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Google Calendar event creation failed:', response.status, errText);
    throw new Error(`Google Calendar sync failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return {
    eventId: data.id,
    htmlLink: data.htmlLink,
  };
}

/**
 * Send an automated notification email via Gmail API using RFC 2822 format base64 encoded
 */
export async function sendGmailNotification(emailData: {
  toEmail: string;
  toName?: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
}): Promise<{ id: string; threadId: string }> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Gmail access token missing. Please sign in with Google with Gmail permissions.');
  }

  const boundary = '==COAB_BOUNDARY_XYZ==';
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(emailData.subject)))}?=`;

  let emailLines: string[] = [
    `To: ${emailData.toName ? `"${emailData.toName}" <${emailData.toEmail}>` : emailData.toEmail}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    emailData.bodyText,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    emailData.bodyHtml || `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #092638;"><p>${emailData.bodyText.replace(/\n/g, '<br/>')}</p><hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;"/><p style="font-size: 12px; color: #6b7280;">Western Leyte College - College of Accountancy & Business Media Committee</p></div>`,
    '',
    `--${boundary}--`
  ];

  const rawString = emailLines.join('\r\n');
  // Safe base64 url-safe encoding
  const rawBase64 = btoa(unescape(encodeURIComponent(rawString)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: rawBase64 }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Gmail send failed:', response.status, errText);
    throw new Error(`Gmail API failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    threadId: data.threadId,
  };
}
