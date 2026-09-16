export type Role = 'admin' | 'editor' | 'contributor';

export type Specialization = 'PHOTO' | 'VIDEO' | 'GRAPHICS' | 'SOCIAL' | 'EDITING';

export type CoabOrg = 'JPIA' | 'JFMA' | 'JHRMS' | 'YES' | 'COAB' | 'BSBA';

export type CourseProgram = 
  | 'BSA' 
  | 'BSAIS' 
  | 'BSBA-FM' 
  | 'BSBA-HRM' 
  | 'BS-ENTREP';

export type EventCategory = 'JPIA' | 'BSBA' | 'COAB';

export type EisenhowerUrgency = 
  | 'urgent_important'      // Do First (Urgent & Important)
  | 'not_urgent_important'  // Schedule / Plan (Not Urgent, Important)
  | 'urgent_not_important'  // Delegate (Urgent, Not Important)
  | 'not_urgent_not_important'; // Don't Do / Backlog (Neither)

export type DeliverableStatus = 'pending' | 'in_progress' | 'under_review' | 'completed' | 'overdue';

export interface UserProfile {
  id: string; // auth uid or unique id
  name: string;
  email: string;
  photoUrl?: string;
  org: CoabOrg;
  position: string;
  courseProgram: CourseProgram;
  contactNumber: string;
  specializations: Specialization[];
  role: Role;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubTask {
  id: string;
  title: string;
  assignedToId?: string;
  assignedToName?: string;
  dueDate?: string; // YYYY-MM-DD
  completed: boolean;
}

export interface Deliverable {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  assignedToId?: string; // Profile id from Directory
  assignedToName?: string;
  assignedToEmail?: string;
  urgency: EisenhowerUrgency;
  dueDate: string; // ISO date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm)
  status: DeliverableStatus;
  subtasks?: SubTask[];
  driveLink?: string; // Google Drive file or folder link
  driveFileId?: string;
  driveFileName?: string;
  calendarEventId?: string; // Google Calendar Event ID if synced
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CoabEvent {
  id: string;
  name: string;
  category: EventCategory;
  leadId?: string; // Directory Profile ID
  leadName?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  location?: string;
  calendarEventId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'approaching_deadline' | 'overdue_deliverable' | 'task_assigned' | 'status_updated' | 'system';
  title: string;
  message: string;
  deliverableId?: string;
  eventId?: string;
  timestamp: string;
  read: boolean;
  targetUserEmail?: string;
}

export interface NotificationSettings {
  emailAlerts: boolean;
  inAppAlerts: boolean;
  remindDaysBefore: number; // e.g. 1 or 2 days before
  alertOverdue: boolean;
  alertNewAssignment: boolean;
}
