import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { sendGmailNotification } from '../lib/workspace';
import { 
  Bell, 
  Send, 
  Check, 
  CheckCheck, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  Mail, 
  Settings, 
  Sparkles, 
  Calendar,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { 
    notifications, 
    markNotificationRead, 
    clearAllNotifications, 
    notificationSettings, 
    updateNotificationSettings, 
    deliverables, 
    members,
    userRole,
    currentUser
  } = useApp();

  const [isDispatchingEmail, setIsDispatchingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  // Manual Test Email Alert Trigger using connected GMail API
  const handleSendTestEmail = async (deliverableId: string) => {
    const targetDel = deliverables.find((d) => d.id === deliverableId);
    if (!targetDel) return;

    const targetMember = members.find((m) => m.id === targetDel.assignedToId);
    const toEmail = targetMember?.email || currentUser?.email || 'makabentajustin55@gmail.com';
    const toName = targetMember?.name || 'COAB Media Officer';

    const confirmed = window.confirm(
      `Send automated Gmail reminder to ${toName} (${toEmail}) for deliverable "${targetDel.title}" due on ${targetDel.dueDate}?`
    );
    if (!confirmed) return;

    try {
      setIsDispatchingEmail(true);
      setEmailStatus('Dispatching email via Gmail API...');

      const subject = `[COAB Media Alert] Reminder: ${targetDel.title} is due on ${targetDel.dueDate}`;
      const bodyText = `Hello ${toName},\n\nThis is an automated notification from the Western Leyte College COAB Media Tracker.\n\nDeliverable: ${targetDel.title}\nUrgency: ${targetDel.urgency}\nDue Date: ${targetDel.dueDate}\nCurrent Status: ${targetDel.status}\nDrive Link: ${targetDel.driveLink || 'Not yet uploaded'}\n\nPlease ensure the media output is prepared and submitted before the deadline.\n\nWarm regards,\nCOAB Media Committee Operations`;

      await sendGmailNotification({
        toEmail,
        toName,
        subject,
        bodyText,
      });

      setEmailStatus(`Gmail successfully sent to ${toEmail}!`);
      setTimeout(() => setEmailStatus(null), 5000);
    } catch (err: any) {
      console.warn('Gmail API notification error:', err);
      alert(`Gmail Dispatch Note: ${err.message || 'Make sure Gmail OAuth permission is enabled in your Google account.'}`);
      setEmailStatus(null);
    } finally {
      setIsDispatchingEmail(false);
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'overdue_deliverable':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'approaching_deadline':
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-[#064420] dark:text-[#4ade80]" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#092638] dark:text-white flex items-center gap-2">
            <span>Automated Notification Center</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#064420]/10 text-[#064420] dark:text-[#4ade80] dark:bg-[#064420]/30 font-medium">
              GMail API Enabled
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time deadline reminders, automated overdue alerts, and direct GMail dispatch.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={clearAllNotifications}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Alerts</span>
          </button>
        )}
      </div>

      {emailStatus && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{emailStatus}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left Column: Notification Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-[#0b2434] rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs p-4 sm:p-6">
            <h2 className="text-base font-bold text-[#092638] dark:text-white mb-4 flex items-center justify-between">
              <span>Activity & Deadline Alerts</span>
              <span className="text-xs font-normal text-slate-400">
                {notifications.length} total
              </span>
            </h2>

            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No active notifications or overdue alerts. Everything is on schedule!
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      notif.read
                        ? 'bg-slate-50/40 dark:bg-[#061722]/30 border-slate-100 dark:border-slate-800 text-slate-500'
                        : 'bg-white dark:bg-[#061722] border-[#064420]/20 dark:border-[#4ade80]/20 shadow-xs text-[#092638] dark:text-white'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                        {getNotifIcon(notif.type)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold leading-tight">
                          {notif.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-2 block">
                          {new Date(notif.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      {!notif.read && (
                        <button
                          onClick={() => markNotificationRead(notif.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#064420] dark:hover:text-[#4ade80] hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {notif.deliverableId && (
                        <button
                          onClick={() => handleSendTestEmail(notif.deliverableId!)}
                          disabled={isDispatchingEmail}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#064420] text-white hover:bg-[#245439] text-[10px] font-semibold transition-all"
                          title="Send direct Gmail reminder"
                        >
                          {isDispatchingEmail ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Mail className="w-3 h-3" />
                          )}
                          <span>Send Email</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Notification Configuration by Users & Admins */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0b2434] rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs p-4 sm:p-6 space-y-5">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Settings className="w-4 h-4 text-[#064420] dark:text-[#4ade80]" />
              <h3 className="text-sm font-bold text-[#092638] dark:text-white">
                Notification Preferences
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure how automated reminders for approaching deadlines, overdue warnings, and new assignments are broadcasted.
            </p>

            <div className="space-y-4 text-xs">
              
              {/* In-app alerts toggle */}
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  In-App Notification Feed
                </span>
                <input
                  type="checkbox"
                  checked={notificationSettings.inAppAlerts}
                  onChange={(e) => updateNotificationSettings({ inAppAlerts: e.target.checked })}
                  className="w-4 h-4 rounded text-[#064420] focus:ring-[#064420]"
                />
              </label>

              {/* Email alerts toggle */}
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Automated GMail Reminders
                </span>
                <input
                  type="checkbox"
                  checked={notificationSettings.emailAlerts}
                  onChange={(e) => updateNotificationSettings({ emailAlerts: e.target.checked })}
                  className="w-4 h-4 rounded text-[#064420] focus:ring-[#064420]"
                />
              </label>

              {/* Overdue alert trigger */}
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Alert on Overdue Tasks
                </span>
                <input
                  type="checkbox"
                  checked={notificationSettings.alertOverdue}
                  onChange={(e) => updateNotificationSettings({ alertOverdue: e.target.checked })}
                  className="w-4 h-4 rounded text-[#064420] focus:ring-[#064420]"
                />
              </label>

              {/* Assignment alert trigger */}
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Notify Assignees on New Task
                </span>
                <input
                  type="checkbox"
                  checked={notificationSettings.alertNewAssignment}
                  onChange={(e) => updateNotificationSettings({ alertNewAssignment: e.target.checked })}
                  className="w-4 h-4 rounded text-[#064420] focus:ring-[#064420]"
                />
              </label>

              {/* Days before deadline slider */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                  <span>Advance Reminder</span>
                  <span className="text-[#064420] dark:text-[#4ade80] font-bold">
                    {notificationSettings.remindDaysBefore} day{notificationSettings.remindDaysBefore > 1 ? 's' : ''} before
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={notificationSettings.remindDaysBefore}
                  onChange={(e) => updateNotificationSettings({ remindDaysBefore: Number(e.target.value) })}
                  className="w-full accent-[#064420]"
                />
              </div>
            </div>
          </div>

          {/* Quick Action Deliverable Reminders */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-[#0b2434] border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-3">
            <h4 className="font-bold text-[#092638] dark:text-white uppercase tracking-wider text-[10px]">
              Active Deliverables Quick Dispatch
            </h4>
            <div className="space-y-2">
              {deliverables.length === 0 ? (
                <p className="text-slate-400 text-[11px] py-1">No active deliverables to dispatch.</p>
              ) : (
                deliverables.slice(0, 3).map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#061722] border border-slate-200 dark:border-slate-800">
                    <div className="truncate mr-2">
                      <p className="font-semibold text-[#092638] dark:text-white truncate">{d.title}</p>
                      <p className="text-[10px] text-slate-400">Due: {d.dueDate}</p>
                    </div>
                    <button
                      onClick={() => handleSendTestEmail(d.id)}
                      disabled={isDispatchingEmail}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#064420] hover:text-white transition-colors"
                      title="Send automated GMail notification"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
