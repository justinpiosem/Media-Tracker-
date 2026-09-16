import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EisenhowerUrgency, DeliverableStatus, Deliverable, SubTask, CoabEvent } from '../types';
import { uploadFileToDrive } from '../lib/workspace';
import { formatFullDate } from './EisenhowerView';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Upload, 
  ExternalLink, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Filter, 
  Sparkles, 
  UserCheck, 
  Layers, 
  Tag,
  Loader2,
  FolderPlus,
  Flame,
  FileCheck,
  ChevronDown,
  ChevronRight,
  ListTodo,
  Check,
  ArrowRight,
  ArrowUpDown,
  CalendarDays
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    events, 
    deliverables, 
    members, 
    userRole, 
    addEvent, 
    updateEvent, 
    deleteEvent, 
    addDeliverable, 
    updateDeliverable, 
    deleteDeliverable,
    addSubTask,
    deleteSubTask,
    toggleSubTask,
    currentUser,
    currentProfile,
    setCurrentTab
  } = useApp();

  // Active Category Filter for Events (COAB, JPIA, BSBA, or ALL)
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'COAB' | 'JPIA' | 'BSBA'>('ALL');
  
  // Sorting for Events
  const [eventSort, setEventSort] = useState<'date_asc' | 'date_desc' | 'name_asc' | 'deliverables_count'>('date_asc');
  
  // Single Event focus vs. All Events visible in one scroll
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  
  // Active Event Selected Tab (for single view)
  const [activeEventId, setActiveEventId] = useState<string>(events[0]?.id || '');
  
  // Filter for deliverable quadrant / status
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [filterOverdueOnly, setFilterOverdueOnly] = useState<boolean>(false);

  // Sub-task expansion state: Set of deliverable IDs that have expanded sub-tasks
  const [expandedSubtasks, setExpandedSubtasks] = useState<Record<string, boolean>>({});

  // Inline Subtask add form state per deliverable
  const [newSubtaskTitle, setNewSubtaskTitle] = useState<Record<string, string>>({});
  const [newSubtaskMember, setNewSubtaskMember] = useState<Record<string, string>>({});
  const [newSubtaskDate, setNewSubtaskDate] = useState<Record<string, string>>({});

  // Modals state
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [isNewDeliverableModalOpen, setIsNewDeliverableModalOpen] = useState(false);
  const [targetEventForDeliverable, setTargetEventForDeliverable] = useState<string>('');
  const [editingDeliverableId, setEditingDeliverableId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Drive upload state
  const [isUploadingToDrive, setIsUploadingToDrive] = useState<string | null>(null);

  // Check if today is beyond due date
  const isOverdue = (dueDateStr: string, status: DeliverableStatus) => {
    if (status === 'completed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const isApproaching = (dueDateStr: string, status: DeliverableStatus) => {
    if (status === 'completed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  // Filter and Sort Events
  const filteredEvents = events
    .filter((e) => {
      if (selectedCategory === 'ALL') return true;
      return e.category === selectedCategory;
    })
    .sort((a, b) => {
      if (eventSort === 'date_asc') return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      if (eventSort === 'date_desc') return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      if (eventSort === 'name_asc') return a.name.localeCompare(b.name);
      if (eventSort === 'deliverables_count') {
        const countA = deliverables.filter((d) => d.eventId === a.id).length;
        const countB = deliverables.filter((d) => d.eventId === b.id).length;
        return countB - countA;
      }
      return 0;
    });

  const activeEvent = events.find((e) => e.id === activeEventId) || filteredEvents[0] || events[0];

  // Filter deliverables for an event
  const getFilteredDeliverables = (eventId: string) => {
    return deliverables.filter((d) => {
      if (d.eventId !== eventId) return false;
      if (urgencyFilter !== 'ALL' && d.urgency !== urgencyFilter) return false;
      if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
      if (filterOverdueOnly && !isOverdue(d.dueDate, d.status)) return false;
      return true;
    });
  };

  // Metrics Calculations
  const totalDeliverables = deliverables.length;
  const pendingDeliverables = deliverables.filter((d) => d.status !== 'completed').length;
  const urgentTasks = deliverables.filter((d) => 
    (d.urgency === 'urgent_important' || d.urgency === 'urgent_not_important') && d.status !== 'completed'
  ).length;
  const overdueTasks = deliverables.filter((d) => isOverdue(d.dueDate, d.status)).length;

  // Actual respective Eisenhower quadrant names instead of Q1/Q2/Q3/Q4
  const quadrantLabels: Record<EisenhowerUrgency, { name: string; fullTitle: string; badge: string }> = {
    urgent_important: {
      name: 'Do First',
      fullTitle: 'Do First (Urgent & Important)',
      badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
    },
    not_urgent_important: {
      name: 'Schedule',
      fullTitle: 'Schedule (Important, Not Urgent)',
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    },
    urgent_not_important: {
      name: 'Delegate',
      fullTitle: 'Delegate (Urgent, Not Important)',
      badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    },
    not_urgent_not_important: {
      name: 'Backlog',
      fullTitle: 'Backlog (Not Urgent & Not Important)',
      badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
    },
  };

  const statusBadges: Record<DeliverableStatus, { text: string; bg: string }> = {
    pending: { text: 'Pending', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' },
    in_progress: { text: 'In Progress', bg: 'bg-[#245439]/15 text-[#245439] dark:text-[#6ee7b7]' },
    under_review: { text: 'Review', bg: 'bg-[#E1910F]/15 text-[#E1910F]' },
    completed: { text: 'Done', bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
    overdue: { text: 'Overdue', bg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400' },
  };

  const toggleExpand = (delId: string) => {
    setExpandedSubtasks((prev) => ({
      ...prev,
      [delId]: !prev[delId],
    }));
  };

  const handleAddSubTaskSubmit = (deliverableId: string, e: React.FormEvent) => {
    e.preventDefault();
    const title = newSubtaskTitle[deliverableId]?.trim();
    if (!title) return;
    const memberId = newSubtaskMember[deliverableId] || members[0]?.id || '';
    const member = members.find((m) => m.id === memberId);
    const dueDate = newSubtaskDate[deliverableId] || new Date().toISOString().split('T')[0];

    addSubTask(deliverableId, {
      title,
      assignedToId: memberId,
      assignedToName: member?.name || '',
      dueDate,
      completed: false,
    });

    setNewSubtaskTitle((prev) => ({ ...prev, [deliverableId]: '' }));
    setNewSubtaskDate((prev) => ({ ...prev, [deliverableId]: '' }));
  };

  const handleFileUpload = async (deliverableId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingToDrive(deliverableId);
      const res = await uploadFileToDrive(file);
      updateDeliverable(deliverableId, {
        driveLink: res.webViewLink,
        driveFileId: res.fileId,
        driveFileName: res.name,
      });
      alert(`File "${file.name}" uploaded to Google Drive! Link saved to deliverable.`);
    } catch (err: any) {
      console.warn('Drive upload error or auth prompt:', err);
      const manualLink = prompt('Could not directly upload via Google Drive OAuth token. Please paste your Google Drive deliverable link here:');
      if (manualLink) {
        updateDeliverable(deliverableId, {
          driveLink: manualLink,
          driveFileName: file.name,
        });
      }
    } finally {
      setIsUploadingToDrive(null);
      e.target.value = '';
    }
  };

  const getMemberPhoto = (memberId?: string, memberName?: string) => {
    const m = members.find((mem) => mem.id === memberId || mem.name === memberName);
    return m?.photoUrl;
  };

  const canEdit = userRole === 'admin' || userRole === 'editor';
  const canDelete = userRole === 'admin';

  // Render a deliverables table for an event
  const renderDeliverablesTable = (evt: CoabEvent) => {
    const eventDeliverables = getFilteredDeliverables(evt.id);

    return (
      <div>
        {/* DESKTOP VIEW: Data Table (hidden on mobile and small tablets) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-700/80 bg-slate-50/40 dark:bg-[#061722]/20 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              <th className="py-3 px-6">Deliverable & Scope</th>
              <th className="py-3 px-4">Priority Quadrant</th>
              <th className="py-3 px-4">Assigned Member</th>
              <th className="py-3 px-4">Deadline & Flags</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-6">Google Drive Deliverable</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            {eventDeliverables.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <p className="text-xs font-medium">No deliverables found for this event.</p>
                    {canEdit && (
                      <button
                        onClick={() => {
                          setTargetEventForDeliverable(evt.id);
                          setIsNewDeliverableModalOpen(true);
                        }}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#064420] text-white text-xs font-semibold hover:bg-[#245439] transition-all shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Deliverable</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              eventDeliverables.map((del) => {
                const overdue = isOverdue(del.dueDate, del.status);
                const approaching = isApproaching(del.dueDate, del.status);
                const isAssignee = currentProfile?.id === del.assignedToId || currentUser?.email?.toLowerCase() === del.assignedToEmail?.toLowerCase();
                const canChangeStatus = canEdit || (userRole === 'contributor' && isAssignee);
                const memberPhoto = getMemberPhoto(del.assignedToId, del.assignedToName);

                const subtasks = del.subtasks || [];
                const subtaskCount = subtasks.length;
                const subtaskDone = subtasks.filter((s) => s.completed).length;
                const isExpanded = !!expandedSubtasks[del.id];

                return (
                  <React.Fragment key={del.id}>
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      
                      {/* Deliverable title, desc, and Subtask expand button */}
                      <td className="py-4 px-6 max-w-xs">
                        <div className="font-semibold text-[#092638] dark:text-white">
                          {del.title}
                        </div>
                        {del.description && (
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            {del.description}
                          </p>
                        )}

                        {/* Subtasks pill & toggle */}
                        <div className="mt-2 flex items-center space-x-2">
                          <button
                            onClick={() => toggleExpand(del.id)}
                            className="inline-flex items-center space-x-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          >
                            <ListTodo className="w-3.5 h-3.5 text-[#064420] dark:text-[#4ade80]" />
                            <span>
                              {subtaskCount > 0 ? `${subtaskDone}/${subtaskCount} Sub-tasks` : 'Sub-tasks'}
                            </span>
                            {isExpanded ? (
                              <ChevronDown className="w-3 h-3" />
                            ) : (
                              <ChevronRight className="w-3 h-3" />
                            )}
                          </button>

                          {subtaskCount > 0 && (
                            <span className="text-[10px] text-slate-400">
                              {subtaskDone === subtaskCount ? (
                                <span className="text-emerald-600 font-semibold">100% complete</span>
                              ) : (
                                `${Math.round((subtaskDone / subtaskCount) * 100)}% done`
                              )}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actual Quadrant Name (Do First, Schedule, Delegate, Backlog) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold border ${quadrantLabels[del.urgency].badge}`}>
                          {quadrantLabels[del.urgency].name}
                        </span>
                      </td>

                      {/* Assigned Member: Profile Picture and Name ONLY (no email) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {del.assignedToName ? (
                          <div className="flex items-center space-x-2.5">
                            {memberPhoto ? (
                              <img
                                src={memberPhoto}
                                alt={del.assignedToName}
                                className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-[#064420] text-white flex items-center justify-center text-[11px] font-bold shadow-2xs">
                                {del.assignedToName.charAt(0)}
                              </div>
                            )}
                            <span className="font-semibold text-[#092638] dark:text-slate-100">
                              {del.assignedToName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Deadline & Flags: Full Month, DD, YYYY format */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-slate-700 dark:text-slate-200">
                            {formatFullDate(del.dueDate)}
                          </span>
                          
                          {/* Flags */}
                          {overdue ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400">
                              <AlertTriangle className="w-3 h-3" />
                              Overdue
                            </span>
                          ) : approaching ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                              <Clock className="w-3 h-3" />
                              Approaching
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Status Check / Dropdown */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {canChangeStatus ? (
                          <select
                            value={del.status}
                            onChange={(e) => updateDeliverable(del.id, { status: e.target.value as DeliverableStatus })}
                            className={`text-[11px] font-semibold py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#061722] focus:outline-none ${statusBadges[del.status].bg}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="under_review">Review</option>
                            <option value="completed">Completed</option>
                            <option value="overdue">Overdue</option>
                          </select>
                        ) : (
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold ${statusBadges[del.status].bg}`}>
                            {statusBadges[del.status].text}
                          </span>
                        )}
                      </td>

                      {/* Uploadable Google Drive Link Cell */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {del.driveLink ? (
                            <a
                              href={del.driveLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:underline text-xs font-semibold"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              <span className="max-w-[120px] truncate">{del.driveFileName || 'Drive Asset'}</span>
                              <ExternalLink className="w-3 h-3 ml-0.5" />
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">No file uploaded</span>
                          )}

                          {/* File Upload Trigger */}
                          {canEdit && (
                            <label className="cursor-pointer p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Upload directly to Google Drive">
                              {isUploadingToDrive === del.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#064420]" />
                              ) : (
                                <Upload className="w-3.5 h-3.5" />
                              )}
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileUpload(del.id, e)}
                              />
                            </label>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          {canEdit && (
                            <button
                              onClick={() => setEditingDeliverableId(del.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#092638] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Configure deliverable"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => {
                                if (confirm(`Delete deliverable "${del.title}"?`)) {
                                  deleteDeliverable(del.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                              title="Delete deliverable"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDABLE SUB-TASKS ROW */}
                    {isExpanded && (
                      <tr className="bg-slate-50/70 dark:bg-[#061722]/50 border-b border-slate-200/80 dark:border-slate-800">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="bg-white dark:bg-[#092638] rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-[#092638] dark:text-white flex items-center gap-1.5">
                                <ListTodo className="w-3.5 h-3.5 text-[#064420] dark:text-[#4ade80]" />
                                <span>Sub-tasks for &ldquo;{del.title}&rdquo;</span>
                              </h4>
                              <span className="text-[11px] text-slate-400">
                                Completing all sub-tasks automatically marks deliverable as done
                              </span>
                            </div>

                            {/* Sub-tasks list */}
                            <div className="space-y-1.5">
                              {subtasks.length === 0 ? (
                                <p className="text-xs text-slate-400 italic py-2">
                                  No sub-tasks yet. Use the form below to add broken-down milestones.
                                </p>
                              ) : (
                                subtasks.map((sub) => {
                                  const subPhoto = getMemberPhoto(sub.assignedToId, sub.assignedToName);
                                  return (
                                    <div
                                      key={sub.id}
                                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#061722] border border-slate-200/60 dark:border-slate-800/80 text-xs"
                                    >
                                      <div className="flex items-center space-x-3">
                                        <button
                                          onClick={() => toggleSubTask(del.id, sub.id)}
                                          className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${
                                            sub.completed
                                              ? 'bg-emerald-500 text-white shadow-2xs'
                                              : 'border border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                                          }`}
                                        >
                                          {sub.completed && <Check className="w-3 h-3 stroke-[3]" />}
                                        </button>
                                        <span className={`font-medium ${
                                          sub.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-[#092638] dark:text-white'
                                        }`}>
                                          {sub.title}
                                        </span>
                                      </div>

                                      <div className="flex items-center space-x-4">
                                        {/* Member (Name + Profile Picture only) */}
                                        {sub.assignedToName && (
                                          <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300">
                                            {subPhoto ? (
                                              <img
                                                src={subPhoto}
                                                alt={sub.assignedToName}
                                                className="w-5 h-5 rounded-full object-cover"
                                                referrerPolicy="no-referrer"
                                              />
                                            ) : (
                                              <div className="w-5 h-5 rounded-full bg-[#064420] text-white flex items-center justify-center text-[9px] font-bold">
                                                {sub.assignedToName.charAt(0)}
                                              </div>
                                            )}
                                            <span className="text-[11px] font-medium">{sub.assignedToName}</span>
                                          </div>
                                        )}

                                        {/* Due date formatted */}
                                        {sub.dueDate && (
                                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                            <CalendarIcon className="w-3 h-3 text-slate-400" />
                                            {formatFullDate(sub.dueDate)}
                                          </span>
                                        )}

                                        {canEdit && (
                                          <button
                                            onClick={() => deleteSubTask(del.id, sub.id)}
                                            className="text-slate-400 hover:text-red-500 p-1"
                                            title="Delete sub-task"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>

                            {/* Add Subtask Quick Form */}
                            {canEdit && (
                              <form
                                onSubmit={(e) => handleAddSubTaskSubmit(del.id, e)}
                                className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                              >
                                <input
                                  type="text"
                                  placeholder="Add a new sub-task (e.g. Color grade B-roll)..."
                                  value={newSubtaskTitle[del.id] || ''}
                                  onChange={(e) =>
                                    setNewSubtaskTitle((prev) => ({ ...prev, [del.id]: e.target.value }))
                                  }
                                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#064420]"
                                />

                                <select
                                  value={newSubtaskMember[del.id] || ''}
                                  onChange={(e) =>
                                    setNewSubtaskMember((prev) => ({ ...prev, [del.id]: e.target.value }))
                                  }
                                  className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white focus:outline-none"
                                >
                                  <option value="">Assign Member</option>
                                  {members.map((m) => (
                                    <option key={m.id} value={m.id}>
                                      {m.name}
                                    </option>
                                  ))}
                                </select>

                                <input
                                  type="date"
                                  value={newSubtaskDate[del.id] || ''}
                                  onChange={(e) =>
                                    setNewSubtaskDate((prev) => ({ ...prev, [del.id]: e.target.value }))
                                  }
                                  className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white focus:outline-none"
                                />

                                <button
                                  type="submit"
                                  className="px-3.5 py-1.5 rounded-xl bg-[#064420] hover:bg-[#245439] text-white text-xs font-semibold shrink-0 transition-colors shadow-2xs"
                                >
                                  Add Sub-task
                                </button>
                              </form>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE & TABLET VIEW: Touch-Friendly Responsive Card Feed */}
      <div className="block md:hidden p-3 sm:p-4 space-y-3">
        {eventDeliverables.length === 0 ? (
          <div className="py-10 text-center text-slate-400 dark:text-slate-500">
            <p className="text-xs font-medium">No deliverables found for this event.</p>
            {canEdit && (
              <button
                onClick={() => {
                  setTargetEventForDeliverable(evt.id);
                  setIsNewDeliverableModalOpen(true);
                }}
                className="mt-3 inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#064420] text-white text-xs font-semibold hover:bg-[#245439] transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Deliverable</span>
              </button>
            )}
          </div>
        ) : (
          eventDeliverables.map((del) => {
            const overdue = isOverdue(del.dueDate, del.status);
            const approaching = isApproaching(del.dueDate, del.status);
            const isAssignee = currentProfile?.id === del.assignedToId || currentUser?.email?.toLowerCase() === del.assignedToEmail?.toLowerCase();
            const canChangeStatus = canEdit || (userRole === 'contributor' && isAssignee);
            const memberPhoto = getMemberPhoto(del.assignedToId, del.assignedToName);

            const subtasks = del.subtasks || [];
            const subtaskCount = subtasks.length;
            const subtaskDone = subtasks.filter((s) => s.completed).length;
            const isExpanded = !!expandedSubtasks[del.id];

            return (
              <div
                key={del.id}
                className="bg-white dark:bg-[#092638] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-3"
              >
                {/* Top Bar: Quadrant Badge + Overdue Alert + Quick Actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold border ${quadrantLabels[del.urgency].badge}`}>
                      {quadrantLabels[del.urgency].name}
                    </span>
                    {overdue && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md">
                        <AlertTriangle className="w-3 h-3" />
                        Overdue
                      </span>
                    )}
                    {approaching && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                        <Clock className="w-3 h-3" />
                        Due Soon
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    {canEdit && (
                      <button
                        onClick={() => setEditingDeliverableId(del.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#092638] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Configure"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete deliverable "${del.title}"?`)) {
                            deleteDeliverable(del.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-bold text-sm text-[#092638] dark:text-white leading-snug">
                    {del.title}
                  </h3>
                  {del.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {del.description}
                    </p>
                  )}
                </div>

                {/* Assignee & Deadline Row */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                  {del.assignedToName ? (
                    <div className="flex items-center space-x-2">
                      {memberPhoto ? (
                        <img
                          src={memberPhoto}
                          alt={del.assignedToName}
                          className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#064420] text-white flex items-center justify-center text-[10px] font-bold">
                          {del.assignedToName.charAt(0)}
                        </div>
                      )}
                      <span className="font-semibold text-slate-700 dark:text-slate-200 text-xs truncate max-w-[130px]">
                        {del.assignedToName}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs italic">Unassigned</span>
                  )}

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Deadline</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                      {formatFullDate(del.dueDate)}
                    </span>
                  </div>
                </div>

                {/* Status & Google Drive Link Row */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  {/* Status Dropdown */}
                  <div className="flex-1 min-w-[130px]">
                    {canChangeStatus ? (
                      <select
                        value={del.status}
                        onChange={(e) => updateDeliverable(del.id, { status: e.target.value as DeliverableStatus })}
                        className={`w-full text-xs font-bold py-1.5 px-2.5 rounded-xl border focus:outline-none cursor-pointer transition-all ${
                          del.status === 'completed'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                            : del.status === 'under_review'
                            ? 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30'
                            : del.status === 'in_progress'
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="under_review">Under Review</option>
                        <option value="completed">Completed</option>
                      </select>
                    ) : (
                      <span className={`inline-block px-2 py-1 rounded-lg text-xs font-bold border ${statusBadges[del.status].bg}`}>
                        {statusBadges[del.status].text}
                      </span>
                    )}
                  </div>

                  {/* Drive Link Action */}
                  <div className="flex items-center space-x-1.5 shrink-0">
                    {del.driveLink ? (
                      <a
                        href={del.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-semibold hover:bg-blue-100"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Drive</span>
                      </a>
                    ) : null}

                    {canEdit && (
                      <label
                        className="cursor-pointer inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 text-xs font-medium"
                        title="Upload file directly to Google Drive"
                      >
                        {isUploadingToDrive === del.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#064420]" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{del.driveLink ? 'Replace' : 'Upload'}</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileUpload(del.id, e)}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Subtasks Accordion Toggle */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => toggleExpand(del.id)}
                    className="w-full flex items-center justify-between text-xs font-semibold py-1 text-slate-600 dark:text-slate-300 hover:text-[#064420]"
                  >
                    <span className="flex items-center gap-1.5">
                      <ListTodo className="w-3.5 h-3.5 text-[#064420] dark:text-[#4ade80]" />
                      <span>
                        {subtaskCount > 0 ? `${subtaskDone}/${subtaskCount} Sub-tasks` : 'Sub-tasks (0)'}
                      </span>
                      {subtaskCount > 0 && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({Math.round((subtaskDone / subtaskCount) * 100)}%)
                        </span>
                      )}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {/* Subtask checklist on mobile */}
                  {isExpanded && (
                    <div className="mt-2 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {subtasks.length === 0 ? (
                        <p className="text-slate-400 text-xs italic">
                          No sub-tasks yet.
                        </p>
                      ) : (
                        subtasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#061722] border border-slate-200/60 dark:border-slate-700/60 text-xs"
                          >
                            <div className="flex items-center space-x-2.5">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleSubTask(del.id, task.id)}
                                className="w-4 h-4 rounded text-[#064420] focus:ring-[#064420] border-slate-300"
                              />
                              <span
                                className={`font-medium ${
                                  task.completed ? 'line-through text-slate-400' : 'text-[#092638] dark:text-white'
                                }`}
                              >
                                {task.title}
                              </span>
                            </div>

                            {canEdit && (
                              <button
                                onClick={() => deleteSubTask(del.id, task.id)}
                                className="text-slate-400 hover:text-red-500 p-1"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))
                      )}

                      {/* Quick Add Subtask on Mobile */}
                      {canEdit && (
                        <form
                          onSubmit={(e) => handleAddSubTaskSubmit(del.id, e)}
                          className="pt-2 flex flex-col gap-2"
                        >
                          <input
                            type="text"
                            placeholder="Add sub-task..."
                            value={newSubtaskTitle[del.id] || ''}
                            onChange={(e) =>
                              setNewSubtaskTitle((prev) => ({ ...prev, [del.id]: e.target.value }))
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#061722] text-[#092638] dark:text-white"
                          />
                          <div className="flex items-center gap-2">
                            <select
                              value={newSubtaskMember[del.id] || ''}
                              onChange={(e) =>
                                setNewSubtaskMember((prev) => ({ ...prev, [del.id]: e.target.value }))
                              }
                              className="flex-1 px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#061722] text-[#092638] dark:text-white"
                            >
                              <option value="">Assign Member</option>
                              {members.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="submit"
                              className="px-3 py-1.5 rounded-xl bg-[#064420] text-white text-xs font-semibold shrink-0"
                            >
                              Add
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Welcome & Metrics Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#092638] dark:text-white flex items-center gap-2">
            <span>COAB Media Operations</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#064420]/10 text-[#064420] dark:text-[#4ade80] dark:bg-[#064420]/30 font-medium">
              Academic Year 2026-2027
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time deliverable matrix, Google Drive assets, and committee workflow sync.
          </p>
        </div>

        {/* Action Button: Create New Event (Admin/Editor) */}
        {canEdit && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsNewEventModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#064420] text-white text-xs font-semibold hover:bg-[#245439] active:scale-95 transition-all shadow-sm"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create Event / Project</span>
            </button>
          </div>
        )}
      </div>

      {/* 4 Apple-Style Minimal Metric Cards with REDIRECTION to Urgent & Overdue Tasks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Deliverables */}
        <button
          onClick={() => {
            setUrgencyFilter('ALL');
            setStatusFilter('ALL');
            setFilterOverdueOnly(false);
          }}
          className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#0b2434] border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-[#064420] dark:hover:border-[#4ade80] text-left transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-[#064420] dark:group-hover:text-[#4ade80]">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Deliverables</span>
            <Layers className="w-4 h-4 shrink-0 text-[#064420] dark:text-[#4ade80]" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5 sm:space-x-2">
            <span className="text-xl sm:text-2xl font-bold text-[#092638] dark:text-white">{totalDeliverables}</span>
            <span className="text-[11px] sm:text-xs text-slate-500">all events</span>
          </div>
          <div className="mt-2 flex items-center text-[10px] font-semibold text-slate-400 group-hover:text-[#064420] dark:group-hover:text-[#4ade80]">
            <span>Show all</span>
            <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5" />
          </div>
        </button>

        {/* Pending Output */}
        <button
          onClick={() => {
            setStatusFilter('pending');
            setFilterOverdueOnly(false);
          }}
          className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#0b2434] border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-[#E1910F] text-left transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-[#E1910F]">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Pending Output</span>
            <Clock className="w-4 h-4 shrink-0 text-[#E1910F]" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5 sm:space-x-2">
            <span className="text-xl sm:text-2xl font-bold text-[#E1910F]">{pendingDeliverables}</span>
            <span className="text-[11px] sm:text-xs text-slate-500">in workflow</span>
          </div>
          <div className="mt-2 flex items-center text-[10px] font-semibold text-slate-400 group-hover:text-[#E1910F]">
            <span>Filter pending</span>
            <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5" />
          </div>
        </button>

        {/* Urgent Tasks - REDIRECT TO EISENHOWER TAB */}
        <button
          onClick={() => setCurrentTab('eisenhower')}
          className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#0b2434] border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-red-500 dark:hover:border-red-400 text-left transition-all group"
          title="Click to open Eisenhower Prioritization Matrix"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-red-500">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Urgent Tasks</span>
            <Flame className="w-4 h-4 shrink-0 text-red-500 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5 sm:space-x-2">
            <span className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">{urgentTasks}</span>
            <span className="text-[11px] sm:text-xs text-slate-500">Do First</span>
          </div>
          <div className="mt-2 flex items-center text-[10px] font-bold text-red-600 dark:text-red-400">
            <span>Eisenhower Matrix</span>
            <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5" />
          </div>
        </button>

        {/* Overdue Deliverables - REDIRECT / FILTER OVERDUE */}
        <button
          onClick={() => {
            setFilterOverdueOnly(true);
            setUrgencyFilter('ALL');
            setStatusFilter('ALL');
          }}
          className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#0b2434] border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-rose-500 dark:hover:border-rose-400 text-left transition-all group"
          title="Click to filter overdue tasks"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-rose-500">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Overdue</span>
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5 sm:space-x-2">
            <span className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">{overdueTasks}</span>
            <span className="text-[11px] sm:text-xs text-slate-500">past deadline</span>
          </div>
          <div className="mt-2 flex items-center text-[10px] font-bold text-rose-600 dark:text-rose-400">
            <span>Filter overdue</span>
            <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5" />
          </div>
        </button>
      </div>

      {/* EVENT CONTROLS: Category Filter + Sorting + View Mode (All visible in one scroll) */}
      <div className="space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700/80 pb-3">
          
          {/* Organization Classify tabs */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-bold uppercase text-slate-400 mr-1 tracking-wider">Classify:</span>
            {(['ALL', 'COAB', 'JPIA', 'BSBA'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#064420] text-white shadow-xs'
                    : 'bg-white dark:bg-[#0b2434] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Right side: Sorting dropdown & Single vs All events view toggle */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Sort Selector */}
            <div className="flex items-center space-x-1.5 flex-1 sm:flex-none">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={eventSort}
                onChange={(e) => setEventSort(e.target.value as any)}
                className="w-full sm:w-auto text-xs font-semibold py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b2434] text-[#092638] dark:text-white focus:outline-none"
              >
                <option value="date_asc">Sort: Earliest Date</option>
                <option value="date_desc">Sort: Latest Date</option>
                <option value="name_asc">Sort: Name (A-Z)</option>
                <option value="deliverables_count">Sort: Most Deliverables</option>
              </select>
            </div>

            {/* View Mode Toggle: Single focus vs All in one scroll */}
            <div className="flex items-center rounded-xl p-0.5 bg-slate-200 dark:bg-slate-800 text-xs">
              <button
                onClick={() => setViewMode('single')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  viewMode === 'single'
                    ? 'bg-white dark:bg-[#0b2434] text-[#064420] dark:text-[#4ade80] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-[#092638]'
                }`}
              >
                Single Event
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  viewMode === 'all'
                    ? 'bg-white dark:bg-[#0b2434] text-[#064420] dark:text-[#4ade80] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-[#092638]'
                }`}
              >
                All Events Scroll
              </button>
            </div>
          </div>
        </div>

        {/* Project Selector Horizontal Scrollable Ribbon */}
        {viewMode === 'single' && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {filteredEvents.map((evt) => {
              const count = deliverables.filter((d) => d.eventId === evt.id).length;
              return (
                <button
                  key={evt.id}
                  onClick={() => setActiveEventId(evt.id)}
                  className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    activeEvent?.id === evt.id
                      ? 'bg-white dark:bg-[#0b2434] text-[#064420] dark:text-[#4ade80] border-[#064420] dark:border-[#4ade80] shadow-sm font-bold ring-2 ring-[#064420]/10 dark:ring-[#4ade80]/10'
                      : 'bg-white/60 dark:bg-[#0b2434]/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-[#0b2434]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    evt.category === 'COAB' ? 'bg-[#E1910F]' : evt.category === 'JPIA' ? 'bg-[#064420]' : 'bg-blue-500'
                  }`} />
                  <span>{evt.name}</span>
                  <span className="text-[10px] opacity-60 font-medium">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* FILTER TOOLBAR: Priority Quadrant Filter + Status Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0b2434] p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Urgency Quadrant Filter (Using Actual Names) */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Quadrant:</span>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="text-xs font-semibold py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#061722] text-[#092638] dark:text-white focus:outline-none"
            >
              <option value="ALL">All Quadrants</option>
              <option value="urgent_important">Do First (Urgent & Important)</option>
              <option value="not_urgent_important">Schedule (Important, Not Urgent)</option>
              <option value="urgent_not_important">Delegate (Urgent, Not Important)</option>
              <option value="not_urgent_not_important">Backlog (Not Urgent & Not Important)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#061722] text-[#092638] dark:text-white focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="under_review">Review</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Overdue filter pill */}
          {filterOverdueOnly && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 text-xs font-semibold">
              <span>Showing Overdue Only</span>
              <button
                onClick={() => setFilterOverdueOnly(false)}
                className="hover:text-rose-800 ml-1 text-xs"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Global Add Deliverable Button */}
        {canEdit && (
          <button
            onClick={() => {
              setTargetEventForDeliverable(activeEvent?.id || filteredEvents[0]?.id || '');
              setIsNewDeliverableModalOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#064420] text-white text-xs font-semibold hover:bg-[#245439] transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Deliverable</span>
          </button>
        )}
      </div>

      {/* RENDER VIEW: Single Event Card OR All Events in One Scroll */}
      {viewMode === 'single' ? (
        activeEvent ? (
          <div className="bg-white dark:bg-[#0b2434] rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
            
            {/* Event Header Banner */}
            <div className="p-6 border-b border-slate-200/80 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-[#061722]/30">
              <div>
                <div className="flex items-center space-x-3">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    activeEvent.category === 'COAB'
                      ? 'bg-[#E1910F]/15 text-[#E1910F] border border-[#E1910F]/30'
                      : activeEvent.category === 'JPIA'
                      ? 'bg-[#064420]/15 text-[#064420] dark:text-[#6ee7b7] border border-[#064420]/30'
                      : 'bg-blue-500/15 text-blue-600 border border-blue-500/30'
                  }`}>
                    {activeEvent.category} Event
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {formatFullDate(activeEvent.startDate)} {activeEvent.endDate ? `to ${formatFullDate(activeEvent.endDate)}` : ''}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#092638] dark:text-white mt-2">
                  {activeEvent.name}
                </h2>
                {activeEvent.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                    {activeEvent.description}
                  </p>
                )}
              </div>

              {/* Event Lead from Directory & Configure Controls */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2.5 bg-white dark:bg-[#092638] px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  {getMemberPhoto(activeEvent.leadId, activeEvent.leadName) ? (
                    <img
                      src={getMemberPhoto(activeEvent.leadId, activeEvent.leadName)}
                      alt={activeEvent.leadName || 'Lead'}
                      className="w-7 h-7 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <UserCheck className="w-4 h-4 text-[#064420] dark:text-[#4ade80]" />
                  )}
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Designated Lead</span>
                    <span className="text-xs font-semibold text-[#092638] dark:text-white">
                      {activeEvent.leadName || 'Unassigned'}
                    </span>
                  </div>
                </div>

                {canEdit && (
                  <button
                    onClick={() => setEditingEventId(activeEvent.id)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs font-semibold flex items-center gap-1.5"
                    title="Configure Event Settings"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Configure</span>
                  </button>
                )}

                {canDelete && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete event "${activeEvent.name}" and all associated deliverables?`)) {
                        deleteEvent(activeEvent.id);
                      }
                    }}
                    className="p-2 rounded-xl border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all text-xs"
                    title="Delete Event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Deliverables Table */}
            {renderDeliverablesTable(activeEvent)}
          </div>
        ) : events.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-[#0b2434] rounded-3xl border border-dashed border-slate-300 dark:border-slate-700/80 p-8 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#064420]/10 text-[#064420] dark:text-[#4ade80] flex items-center justify-center mx-auto mb-4">
              <FolderPlus className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#092638] dark:text-white">No Events or Projects Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
              Welcome to COAB Media Operations. Create your first event or project under COAB, JPIA, or BSBA to begin assigning deliverables, designating leads, setting Eisenhower matrix urgencies, and uploading to Google Drive.
            </p>
            {canEdit && (
              <button
                onClick={() => setIsNewEventModalOpen(true)}
                className="mt-5 inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#064420] text-white text-xs font-semibold hover:bg-[#245439] active:scale-95 transition-all shadow-xs"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Create First Event / Project</span>
              </button>
            )}
          </div>
        ) : (
          <div className="py-16 text-center bg-white dark:bg-[#0b2434] rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <p className="text-sm text-slate-500">No events found in this category.</p>
          </div>
        )
      ) : (
        /* ALL EVENTS VISIBLE IN ONE SCROLL */
        <div className="space-y-8">
          {events.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-[#0b2434] rounded-3xl border border-dashed border-slate-300 dark:border-slate-700/80 p-8 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#064420]/10 text-[#064420] dark:text-[#4ade80] flex items-center justify-center mx-auto mb-4">
                <FolderPlus className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#092638] dark:text-white">No Events or Projects Yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
                Welcome to COAB Media Operations. Create your first event or project to begin tracking deliverables.
              </p>
              {canEdit && (
                <button
                  onClick={() => setIsNewEventModalOpen(true)}
                  className="mt-5 inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#064420] text-white text-xs font-semibold hover:bg-[#245439] active:scale-95 transition-all shadow-xs"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Create First Event / Project</span>
                </button>
              )}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-[#0b2434] rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <p className="text-sm text-slate-500">No events match the selected criteria.</p>
            </div>
          ) : (
            filteredEvents.map((evt) => (
              <div key={evt.id} className="bg-white dark:bg-[#0b2434] rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
                
                {/* Event Header Banner */}
                <div className="p-5 border-b border-slate-200/80 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-[#061722]/30">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        evt.category === 'COAB'
                          ? 'bg-[#E1910F]/15 text-[#E1910F] border border-[#E1910F]/30'
                          : evt.category === 'JPIA'
                          ? 'bg-[#064420]/15 text-[#064420] dark:text-[#6ee7b7] border border-[#064420]/30'
                          : 'bg-blue-500/15 text-blue-600 border border-blue-500/30'
                      }`}>
                        {evt.category}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {formatFullDate(evt.startDate)} {evt.endDate ? `to ${formatFullDate(evt.endDate)}` : ''}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-[#092638] dark:text-white mt-1.5">
                      {evt.name}
                    </h2>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-white dark:bg-[#092638] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                      {getMemberPhoto(evt.leadId, evt.leadName) ? (
                        <img
                          src={getMemberPhoto(evt.leadId, evt.leadName)}
                          alt={evt.leadName || 'Lead'}
                          className="w-6 h-6 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <UserCheck className="w-3.5 h-3.5 text-[#064420] dark:text-[#4ade80]" />
                      )}
                      <span className="text-xs font-semibold text-[#092638] dark:text-white">
                        {evt.leadName || 'Unassigned'}
                      </span>
                    </div>

                    {canEdit && (
                      <button
                        onClick={() => {
                          setTargetEventForDeliverable(evt.id);
                          setIsNewDeliverableModalOpen(true);
                        }}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#064420] text-white text-xs font-semibold hover:bg-[#245439]"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Task</span>
                      </button>
                    )}

                    {canEdit && (
                      <button
                        onClick={() => setEditingEventId(evt.id)}
                        className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Configure Event"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Deliverables Table */}
                {renderDeliverablesTable(evt)}
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL: Create New Event / Project */}
      {isNewEventModalOpen && (
        <CreateEventModal
          onClose={() => setIsNewEventModalOpen(false)}
          onSubmit={(evtData) => {
            const id = addEvent(evtData);
            setActiveEventId(id);
            setIsNewEventModalOpen(false);
          }}
          members={members}
        />
      )}

      {/* MODAL: Configure / Edit Event */}
      {editingEventId && (
        <ConfigureEventModal
          eventId={editingEventId}
          event={events.find((e) => e.id === editingEventId)!}
          members={members}
          onClose={() => setEditingEventId(null)}
          onSave={(data) => {
            updateEvent(editingEventId, data);
            setEditingEventId(null);
          }}
        />
      )}

      {/* MODAL: Create New Deliverable */}
      {isNewDeliverableModalOpen && (
        <CreateDeliverableModal
          eventId={targetEventForDeliverable || activeEvent?.id || events[0]?.id || ''}
          events={events}
          members={members}
          onClose={() => setIsNewDeliverableModalOpen(false)}
          onSubmit={(delData) => {
            addDeliverable(delData);
            setIsNewDeliverableModalOpen(false);
          }}
        />
      )}

      {/* MODAL: Configure / Edit Deliverable */}
      {editingDeliverableId && (
        <ConfigureDeliverableModal
          deliverableId={editingDeliverableId}
          deliverable={deliverables.find((d) => d.id === editingDeliverableId)!}
          members={members}
          onClose={() => setEditingDeliverableId(null)}
          onSave={(data) => {
            updateDeliverable(editingDeliverableId, data);
            setEditingDeliverableId(null);
          }}
        />
      )}
    </div>
  );
};

// Sub-modal: Create Event
const CreateEventModal: React.FC<{
  onClose: () => void;
  onSubmit: (data: any) => void;
  members: any[];
}> = ({ onClose, onSubmit, members }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'COAB' | 'JPIA' | 'BSBA'>('COAB');
  const [leadId, setLeadId] = useState(members[0]?.id || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const designatedLead = members.find((m) => m.id === leadId);
    onSubmit({
      name,
      category,
      leadId,
      leadName: designatedLead?.name || '',
      startDate,
      endDate: endDate || undefined,
      description,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#0b2434] border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
        <h3 className="text-lg font-bold text-[#092638] dark:text-white">Create New COAB Event / Project</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Event / Project Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. COAB Sportsfest & Media Coverage"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium focus:ring-1 focus:ring-[#064420]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Organization Classification</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
              >
                <option value="COAB">COAB (College-wide)</option>
                <option value="JPIA">JPIA (Accountancy)</option>
                <option value="BSBA">BSBA (Business Admin)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Designate Lead (From Directory)</label>
              <select
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.org})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">End Date (Optional)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description / Brief</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Scope of multimedia support, photographers needed, livestream setup..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#064420] text-white hover:bg-[#245439] font-semibold"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Sub-modal: Configure Event
const ConfigureEventModal: React.FC<{
  eventId: string;
  event: any;
  members: any[];
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ event, members, onClose, onSave }) => {
  const [name, setName] = useState(event.name);
  const [category, setCategory] = useState(event.category);
  const [leadId, setLeadId] = useState(event.leadId || '');
  const [startDate, setStartDate] = useState(event.startDate);
  const [endDate, setEndDate] = useState(event.endDate || '');
  const [description, setDescription] = useState(event.description || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const designatedLead = members.find((m) => m.id === leadId);
    onSave({
      name,
      category,
      leadId,
      leadName: designatedLead?.name || '',
      startDate,
      endDate: endDate || undefined,
      description,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#0b2434] border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
        <h3 className="text-lg font-bold text-[#092638] dark:text-white">Configure Event Settings</h3>
        
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Event Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
              >
                <option value="COAB">COAB</option>
                <option value="JPIA">JPIA</option>
                <option value="BSBA">BSBA</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Lead</label>
              <select
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.org})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#064420] text-white hover:bg-[#245439] font-semibold"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Sub-modal: Create Deliverable with Actual Quadrant Names
const CreateDeliverableModal: React.FC<{
  eventId: string;
  events: CoabEvent[];
  members: any[];
  onClose: () => void;
  onSubmit: (data: any) => void;
}> = ({ eventId, events, members, onClose, onSubmit }) => {
  const [selectedEvtId, setSelectedEvtId] = useState(eventId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToId, setAssignedToId] = useState(members[0]?.id || '');
  const [urgency, setUrgency] = useState<EisenhowerUrgency>('urgent_important');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [driveLink, setDriveLink] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    const member = members.find((m) => m.id === assignedToId);
    onSubmit({
      eventId: selectedEvtId,
      title,
      description,
      assignedToId,
      assignedToName: member?.name || '',
      assignedToEmail: member?.email || '',
      urgency,
      dueDate,
      status: 'pending',
      subtasks: [],
      driveLink,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#0b2434] border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
        <h3 className="text-lg font-bold text-[#092638] dark:text-white">Add Deliverable</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Event / Project</label>
            <select
              value={selectedEvtId}
              onChange={(e) => setSelectedEvtId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name} ({evt.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Deliverable Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Highlights Reel (Reels/TikTok 9:16)"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium focus:ring-1 focus:ring-[#064420]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority Quadrant (Eisenhower)</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
              >
                <option value="urgent_important">Do First (Urgent & Important)</option>
                <option value="not_urgent_important">Schedule (Important, Not Urgent)</option>
                <option value="urgent_not_important">Delegate (Urgent, Not Important)</option>
                <option value="not_urgent_not_important">Backlog (Not Urgent & Not Important)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assign Media Member</label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.specializations.join('/') || m.org})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Needed By Date (Deadline)</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Google Drive Link (Optional)</label>
              <input
                type="url"
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes / Specs</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dimensions, export formats (MP4, PNG), audio cues..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#064420] text-white hover:bg-[#245439] font-semibold"
            >
              Save Deliverable
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Sub-modal: Configure Deliverable
const ConfigureDeliverableModal: React.FC<{
  deliverableId: string;
  deliverable: any;
  members: any[];
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ deliverable, members, onClose, onSave }) => {
  const [title, setTitle] = useState(deliverable.title);
  const [description, setDescription] = useState(deliverable.description || '');
  const [assignedToId, setAssignedToId] = useState(deliverable.assignedToId || '');
  const [urgency, setUrgency] = useState<EisenhowerUrgency>(deliverable.urgency);
  const [dueDate, setDueDate] = useState(deliverable.dueDate);
  const [driveLink, setDriveLink] = useState(deliverable.driveLink || '');
  const [status, setStatus] = useState<DeliverableStatus>(deliverable.status);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const member = members.find((m) => m.id === assignedToId);
    onSave({
      title,
      description,
      assignedToId,
      assignedToName: member?.name || '',
      assignedToEmail: member?.email || '',
      urgency,
      dueDate,
      driveLink,
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#0b2434] border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
        <h3 className="text-lg font-bold text-[#092638] dark:text-white">Configure Deliverable</h3>
        
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority Quadrant</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
              >
                <option value="urgent_important">Do First (Urgent & Important)</option>
                <option value="not_urgent_important">Schedule (Important, Not Urgent)</option>
                <option value="urgent_not_important">Delegate (Urgent, Not Important)</option>
                <option value="not_urgent_not_important">Backlog (Not Urgent & Not Important)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assignee</label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Workflow Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="under_review">Review</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Google Drive Link</label>
            <input
              type="url"
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#064420] text-white hover:bg-[#245439] font-semibold"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
