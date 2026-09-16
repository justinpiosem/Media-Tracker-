import React, { createContext, useContext, useState, useEffect } from 'react';
import { CoabEvent, Deliverable, NotificationItem, NotificationSettings, Role, Specialization, SubTask, UserProfile } from '../types';
import { INITIAL_DELIVERABLES, INITIAL_EVENTS, INITIAL_MEMBERS } from '../data/mockData';
import { auth, initAuth, googleSignIn, logout, setCachedAccessToken } from '../lib/firebase';
import { User } from 'firebase/auth';

export type ActiveTab = 'dashboard' | 'eisenhower' | 'calendar' | 'directory' | 'notifications';

interface AppContextType {
  // Theme
  isDark: boolean;
  toggleTheme: () => void;
  // Active Navigation
  currentTab: ActiveTab;
  setCurrentTab: (tab: ActiveTab) => void;
  // Auth & Profile
  currentUser: User | null;
  currentProfile: UserProfile | null;
  userRole: Role;
  isSuperAdmin: boolean;
  isLoadingAuth: boolean;
  authError: string | null;
  clearAuthError: () => void;
  handleSignIn: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  signInWithDemoAdmin: () => void;
  switchMember: (memberId: string) => void;
  updateCurrentProfile: (data: Partial<UserProfile>) => void;
  // Directory Members
  members: UserProfile[];
  updateMemberRole: (memberId: string, role: Role) => void;
  updateMemberSpecializations: (memberId: string, specializations: Specialization[]) => void;
  verifyMemberEmail: (memberId: string) => void;
  createMemberProfile: (profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  // Events
  events: CoabEvent[];
  addEvent: (event: Omit<CoabEvent, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateEvent: (eventId: string, data: Partial<CoabEvent>) => void;
  deleteEvent: (eventId: string) => void;
  // Deliverables
  deliverables: Deliverable[];
  addDeliverable: (del: Omit<Deliverable, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateDeliverable: (id: string, data: Partial<Deliverable>) => void;
  deleteDeliverable: (id: string) => void;
  // Subtasks
  addSubTask: (deliverableId: string, subtask: Omit<SubTask, 'id'>) => void;
  updateSubTask: (deliverableId: string, subtaskId: string, data: Partial<SubTask>) => void;
  deleteSubTask: (deliverableId: string, subtaskId: string) => void;
  toggleSubTask: (deliverableId: string, subtaskId: string) => void;
  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  EVENTS: 'coab_media_events_clean_v1',
  DELIVERABLES: 'coab_media_deliverables_clean_v1',
  MEMBERS: 'coab_media_members_clean_v1',
  NOTIFICATIONS: 'coab_media_notifications_clean_v1',
  SETTINGS: 'coab_media_settings_clean_v1',
  THEME: 'coab_media_theme_v3',
  ACTIVE_MEMBER: 'coab_media_active_member_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');

  // Authentication state (Firebase Google Auth)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);

  const clearAuthError = () => setAuthError(null);

  const switchMember = (memberId: string) => {
    setActiveMemberId(memberId);
  };

  // Entities state
  const [members, setMembers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [events, setEvents] = useState<CoabEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [deliverables, setDeliverables] = useState<Deliverable[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DELIVERABLES);
    return saved ? JSON.parse(saved) : INITIAL_DELIVERABLES;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : {
      emailAlerts: true,
      inAppAlerts: true,
      remindDaysBefore: 1,
      alertOverdue: true,
      alertNewAssignment: true,
    };
  });

  // Clean up legacy mock storage keys on fresh initialization
  useEffect(() => {
    const legacyKeys = [
      'coab_media_events_v3', 'coab_media_deliverables_v3', 'coab_media_members_v3', 'coab_media_notifications_v3',
      'coab_media_events_v2', 'coab_media_deliverables_v2', 'coab_media_members_v2', 'coab_media_notifications_v2',
      'coab_media_events_v1', 'coab_media_deliverables_v1', 'coab_media_members_v1', 'coab_media_notifications_v1'
    ];
    legacyKeys.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore in restricted environments
      }
    });
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem(STORAGE_KEYS.THEME, 'light');
    }
  }, [isDark]);

  // Persist items
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DELIVERABLES, JSON.stringify(deliverables));
  }, [deliverables]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  // Firebase Auth Listener
  useEffect(() => {
    setIsLoadingAuth(true);
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setIsLoadingAuth(false);
        if (token) setCachedAccessToken(token);

        if (user.email) {
          const emailLower = user.email.toLowerCase();
          const isDevAdmin = emailLower === 'makabentajustin55@gmail.com';

          setMembers((prev) => {
            const exists = prev.find((m) => m.email.toLowerCase() === emailLower);
            if (!exists) {
              const newProf: UserProfile = {
                id: user.uid,
                name: user.displayName || 'COAB Member',
                email: user.email!,
                photoUrl: user.photoURL || undefined,
                org: 'COAB',
                position: isDevAdmin ? 'Developer / Chief Administrator' : 'Media Committee Officer',
                courseProgram: 'BSA',
                contactNumber: '',
                specializations: ['PHOTO', 'EDITING'],
                role: isDevAdmin ? 'admin' : 'editor',
                emailVerified: user.emailVerified || false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              return [...prev, newProf];
            } else {
              return prev.map((m) =>
                m.email.toLowerCase() === emailLower
                  ? {
                      ...m,
                      name: user.displayName || m.name,
                      photoUrl: user.photoURL || m.photoUrl,
                      emailVerified: user.emailVerified || m.emailVerified,
                      role: isDevAdmin ? 'admin' : m.role,
                    }
                  : m
              );
            }
          });
        }
      },
      () => {
        setCurrentUser(null);
        setActiveMemberId(null);
        setIsLoadingAuth(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Compute profile strictly from authenticated Firebase user
  const ownProfile = React.useMemo(() => {
    if (!currentUser?.email) return null;
    return members.find((m) => m.email.toLowerCase() === currentUser.email?.toLowerCase()) || null;
  }, [currentUser, members]);

  const currentProfile = React.useMemo(() => {
    if (!currentUser) return null;
    if (activeMemberId) {
      const switched = members.find((m) => m.id === activeMemberId);
      if (switched) return switched;
    }
    return ownProfile;
  }, [currentUser, activeMemberId, ownProfile, members]);

  const userRole: Role = currentProfile?.role || 'contributor';
  const isSuperAdmin = currentUser?.email?.toLowerCase() === 'makabentajustin55@gmail.com';

  const toggleTheme = () => setIsDark((prev) => !prev);

  const handleSignIn = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      const res = await googleSignIn();
      if (res?.user) {
        setCurrentUser(res.user);
      }
      if (res?.accessToken) {
        setCachedAccessToken(res.accessToken);
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      let message = 'Unable to sign in with Google. Please try again.';
      if (err?.code === 'auth/popup-blocked') {
        message = 'Google sign-in popup was blocked by your browser. Please allow popups and click Continue with Google.';
      } else if (err?.code === 'auth/popup-closed-by-user') {
        message = 'Google sign-in was closed before completing. Please click Continue with Google to try again.';
      } else if (err?.code === 'auth/cancelled-popup-request') {
        message = 'A Google sign-in window is already active.';
      } else if (err?.message) {
        message = err.message;
      }
      setAuthError(message);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoadingAuth(true);
      await logout();
      setCurrentUser(null);
      setActiveMemberId(null);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const signInWithDemoAdmin = () => {
    const demoUser = {
      uid: 'lead-1',
      email: 'makabentajustin55@gmail.com',
      displayName: 'Justin Makabenta',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      emailVerified: true,
    } as unknown as User;
    setCurrentUser(demoUser);
    setActiveMemberId('lead-1');
    setIsLoadingAuth(false);
  };

  const updateCurrentProfile = (data: Partial<UserProfile>) => {
    if (!currentProfile) return;
    setMembers((prev) =>
      prev.map((m) => (m.id === currentProfile.id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m))
    );
  };

  const updateMemberRole = (memberId: string, role: Role) => {
    if (userRole !== 'admin') {
      alert('Security Notice: Only administrators can modify member roles.');
      return;
    }
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role, updatedAt: new Date().toISOString() } : m))
    );
  };

  const updateMemberSpecializations = (memberId: string, specializations: Specialization[]) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, specializations, updatedAt: new Date().toISOString() } : m))
    );
  };

  const verifyMemberEmail = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, emailVerified: true, updatedAt: new Date().toISOString() } : m))
    );
  };

  const createMemberProfile = (profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMember: UserProfile = {
      ...profile,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMembers((prev) => [...prev, newMember]);
  };

  const addEvent = (event: Omit<CoabEvent, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const id = `evt-${Date.now()}`;
    const newEvt: CoabEvent = {
      ...event,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEvents((prev) => [newEvt, ...prev]);
    return id;
  };

  const updateEvent = (eventId: string, data: Partial<CoabEvent>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, ...data, updatedAt: new Date().toISOString() } : e))
    );
  };

  const deleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    // Also remove associated deliverables
    setDeliverables((prev) => prev.filter((d) => d.eventId !== eventId));
  };

  const addDeliverable = (del: Omit<Deliverable, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const id = `del-${Date.now()}`;
    const newDel: Deliverable = {
      ...del,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDeliverables((prev) => [newDel, ...prev]);

    // Send in-app notification to assignee if enabled
    if (del.assignedToEmail && notificationSettings.alertNewAssignment) {
      addNotification({
        type: 'task_assigned',
        title: 'New Deliverable Assigned',
        message: `You were assigned to "${del.title}" due on ${del.dueDate}.`,
        deliverableId: id,
        eventId: del.eventId,
        targetUserEmail: del.assignedToEmail,
      });
    }

    return id;
  };

  const updateDeliverable = (id: string, data: Partial<Deliverable>) => {
    setDeliverables((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const updated = { ...d, ...data, updatedAt: new Date().toISOString() };
          if (data.status === 'completed' && !updated.completedAt) {
            updated.completedAt = new Date().toISOString();
          }
          return updated;
        }
        return d;
      })
    );
  };

  const deleteDeliverable = (id: string) => {
    setDeliverables((prev) => prev.filter((d) => d.id !== id));
  };

  const addSubTask = (deliverableId: string, subtask: Omit<SubTask, 'id'>) => {
    setDeliverables((prev) =>
      prev.map((d) => {
        if (d.id === deliverableId) {
          const newSub: SubTask = {
            ...subtask,
            id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          };
          const updatedSubtasks = [...(d.subtasks || []), newSub];
          const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every((s) => s.completed);
          let newStatus = d.status;
          if (allCompleted) {
            newStatus = 'completed';
          } else if (updatedSubtasks.some((s) => s.completed) && d.status === 'pending') {
            newStatus = 'in_progress';
          }
          return {
            ...d,
            subtasks: updatedSubtasks,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return d;
      })
    );
  };

  const updateSubTask = (deliverableId: string, subtaskId: string, data: Partial<SubTask>) => {
    setDeliverables((prev) =>
      prev.map((d) => {
        if (d.id === deliverableId) {
          const updatedSubtasks = (d.subtasks || []).map((s) =>
            s.id === subtaskId ? { ...s, ...data } : s
          );
          const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every((s) => s.completed);
          let newStatus = d.status;
          if (allCompleted) {
            newStatus = 'completed';
          } else if (d.status === 'completed' && !allCompleted) {
            newStatus = 'in_progress';
          } else if (updatedSubtasks.some((s) => s.completed) && d.status === 'pending') {
            newStatus = 'in_progress';
          }
          return {
            ...d,
            subtasks: updatedSubtasks,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return d;
      })
    );
  };

  const deleteSubTask = (deliverableId: string, subtaskId: string) => {
    setDeliverables((prev) =>
      prev.map((d) => {
        if (d.id === deliverableId) {
          const updatedSubtasks = (d.subtasks || []).filter((s) => s.id !== subtaskId);
          const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every((s) => s.completed);
          let newStatus = d.status;
          if (updatedSubtasks.length > 0 && allCompleted) {
            newStatus = 'completed';
          } else if (d.status === 'completed' && updatedSubtasks.length > 0 && !allCompleted) {
            newStatus = 'in_progress';
          }
          return {
            ...d,
            subtasks: updatedSubtasks,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return d;
      })
    );
  };

  const toggleSubTask = (deliverableId: string, subtaskId: string) => {
    setDeliverables((prev) =>
      prev.map((d) => {
        if (d.id === deliverableId) {
          const updatedSubtasks = (d.subtasks || []).map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          );
          const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every((s) => s.completed);
          let newStatus = d.status;
          if (allCompleted) {
            newStatus = 'completed';
          } else if (d.status === 'completed' && !allCompleted) {
            newStatus = 'in_progress';
          } else if (updatedSubtasks.some((s) => s.completed) && d.status === 'pending') {
            newStatus = 'in_progress';
          }
          return {
            ...d,
            subtasks: updatedSubtasks,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return d;
      })
    );
  };

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setNotificationSettings((prev) => ({ ...prev, ...settings }));
  };

  return (
    <AppContext.Provider
      value={{
        isDark,
        toggleTheme,
        currentTab,
        setCurrentTab,
        currentUser,
        currentProfile,
        userRole,
        isSuperAdmin,
        isLoadingAuth,
        authError,
        clearAuthError,
        handleSignIn,
        handleSignOut,
        signInWithDemoAdmin,
        switchMember,
        updateCurrentProfile,
        members,
        updateMemberRole,
        updateMemberSpecializations,
        verifyMemberEmail,
        createMemberProfile,
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        deliverables,
        addDeliverable,
        updateDeliverable,
        deleteDeliverable,
        addSubTask,
        updateSubTask,
        deleteSubTask,
        toggleSubTask,
        notifications,
        markNotificationRead,
        clearAllNotifications,
        addNotification,
        notificationSettings,
        updateNotificationSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
