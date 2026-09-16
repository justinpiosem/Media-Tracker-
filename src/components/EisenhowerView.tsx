import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EisenhowerUrgency, Deliverable, DeliverableStatus } from '../types';
import { 
  Flame, 
  Calendar, 
  Share2, 
  Archive, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileCheck, 
  ExternalLink,
  GripVertical,
  Filter,
  Search,
  ArrowRightLeft
} from 'lucide-react';

export const formatFullDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, monthIndex, day);
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const QUADRANTS: {
  id: EisenhowerUrgency;
  title: string;
  subtitle: string;
  badge: string;
  borderAccent: string;
  bgLight: string;
  headerBg: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'urgent_important',
    title: 'Do First',
    subtitle: 'Urgent & Important',
    badge: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
    borderAccent: 'border-red-500/40 hover:border-red-500/70',
    bgLight: 'bg-red-500/5',
    headerBg: 'bg-red-500/10 text-red-700 dark:text-red-400',
    icon: Flame,
  },
  {
    id: 'not_urgent_important',
    title: 'Schedule',
    subtitle: 'Important, Not Urgent',
    badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    borderAccent: 'border-amber-500/40 hover:border-amber-500/70',
    bgLight: 'bg-amber-500/5',
    headerBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    icon: Calendar,
  },
  {
    id: 'urgent_not_important',
    title: 'Delegate',
    subtitle: 'Urgent, Not Important',
    badge: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    borderAccent: 'border-blue-500/40 hover:border-blue-500/70',
    bgLight: 'bg-blue-500/5',
    headerBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    icon: Share2,
  },
  {
    id: 'not_urgent_not_important',
    title: 'Backlog',
    subtitle: 'Not Urgent & Not Important',
    badge: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
    borderAccent: 'border-slate-400/40 hover:border-slate-400/70',
    bgLight: 'bg-slate-500/5',
    headerBg: 'bg-slate-500/10 text-slate-700 dark:text-slate-400',
    icon: Archive,
  },
];

export const EisenhowerView: React.FC = () => {
  const { deliverables, events, members, userRole, updateDeliverable } = useApp();
  const [selectedEventId, setSelectedEventId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [draggedOverQuadrant, setDraggedOverQuadrant] = useState<EisenhowerUrgency | null>(null);

  const canEdit = userRole === 'admin' || userRole === 'editor';

  // Check if overdue
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
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 2;
  };

  // Filter deliverables
  const filteredDeliverables = deliverables.filter((d) => {
    if (selectedEventId !== 'ALL' && d.eventId !== selectedEventId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = d.title.toLowerCase().includes(q);
      const matchAssignee = d.assignedToName?.toLowerCase().includes(q);
      const matchDesc = d.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchAssignee && !matchDesc) return false;
    }
    return true;
  });

  const getEventName = (eventId: string) => {
    return events.find((e) => e.id === eventId)?.name || 'General Event';
  };

  const getMemberPhoto = (memberId?: string, memberName?: string) => {
    if (memberId) {
      const m = members.find((x) => x.id === memberId);
      if (m?.photoUrl) return m.photoUrl;
    }
    if (memberName) {
      const m = members.find((x) => x.name.toLowerCase() === memberName.toLowerCase());
      if (m?.photoUrl) return m.photoUrl;
    }
    return null;
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, deliverableId: string) => {
    if (!canEdit) return;
    e.dataTransfer.setData('text/plain', deliverableId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, quadrantId: EisenhowerUrgency) => {
    if (!canEdit) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedOverQuadrant !== quadrantId) {
      setDraggedOverQuadrant(quadrantId);
    }
  };

  const handleDragLeave = () => {
    setDraggedOverQuadrant(null);
  };

  const handleDrop = (e: React.DragEvent, quadrantId: EisenhowerUrgency) => {
    if (!canEdit) return;
    e.preventDefault();
    setDraggedOverQuadrant(null);
    const deliverableId = e.dataTransfer.getData('text/plain');
    if (!deliverableId) return;

    const del = deliverables.find((d) => d.id === deliverableId);
    if (del && del.urgency !== quadrantId) {
      updateDeliverable(deliverableId, { urgency: quadrantId });
    }
  };

  const handleMoveQuadrant = (deliverableId: string, targetQuadrant: EisenhowerUrgency) => {
    if (!canEdit) return;
    updateDeliverable(deliverableId, { urgency: targetQuadrant });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Context Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#092638] dark:text-white flex items-center gap-2">
            <span>Eisenhower Matrix</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#064420]/15 dark:bg-[#4ade80]/15 text-[#064420] dark:text-[#4ade80] border border-[#064420]/30 dark:border-[#4ade80]/30">
              Deliverables Only
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Strict read-only view of media deliverables prioritized by urgency and importance. 
            {canEdit ? ' Drag and drop deliverable cards between quadrants to reclassify their priority.' : ' Read-only priority board.'}
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          {/* Project Filter */}
          <div className="flex items-center space-x-2 bg-white dark:bg-[#0b2434] px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex-1 sm:flex-none">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full sm:w-auto text-xs font-semibold bg-transparent text-[#092638] dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Events / Projects</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:flex-none w-full sm:w-auto">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deliverables..."
              className="w-full sm:w-56 pl-8 pr-3 py-1.5 rounded-2xl text-xs bg-white dark:bg-[#0b2434] border border-slate-200 dark:border-slate-700 text-[#092638] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#064420]"
            />
          </div>
        </div>
      </div>

      {/* Eisenhower 2x2 Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {QUADRANTS.map((quadrant) => {
          const items = filteredDeliverables.filter((d) => d.urgency === quadrant.id);
          const Icon = quadrant.icon;
          const isTarget = draggedOverQuadrant === quadrant.id;

          return (
            <div
              key={quadrant.id}
              onDragOver={(e) => handleDragOver(e, quadrant.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, quadrant.id)}
              className={`rounded-3xl border transition-all duration-200 flex flex-col min-h-[380px] sm:min-h-[460px] bg-white dark:bg-[#0b2434] shadow-xs overflow-hidden ${
                isTarget
                  ? 'ring-2 ring-[#064420] dark:ring-[#4ade80] border-[#064420] scale-[1.008]'
                  : 'border-slate-200/80 dark:border-slate-700/80'
              }`}
            >
              {/* Quadrant Header */}
              <div className={`p-3.5 sm:p-5 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2 ${quadrant.headerBg}`}>
                <div className="flex items-center space-x-2.5 sm:space-x-3 flex-1 min-w-0">
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-[#061722]/80 shadow-xs shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <h2 className="font-bold text-sm tracking-tight truncate">
                        {quadrant.title}
                      </h2>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${quadrant.badge}`}>
                        {quadrant.subtitle}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-75 mt-0.5 line-clamp-1 sm:line-clamp-none">
                      {quadrant.id === 'urgent_important' && 'Pressing production emergencies, critical broadcast timelines'}
                      {quadrant.id === 'not_urgent_important' && 'Strategic pre-production shoots, brand identity layouts'}
                      {quadrant.id === 'urgent_not_important' && 'Short-notice operational requests, administrative collateral'}
                      {quadrant.id === 'not_urgent_not_important' && 'Future archive concepts, secondary footage backlogs'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded-full bg-white/80 dark:bg-[#061722]/80 shadow-xs shrink-0">
                  <span>{items.length}</span>
                  <span className="text-[10px] font-medium opacity-60">tasks</span>
                </div>
              </div>

              {/* Deliverables List Area (Drag & Drop Zone) */}
              <div className="p-3 sm:p-5 flex-1 space-y-3 overflow-y-auto max-h-[500px] lg:max-h-[580px] bg-slate-50/40 dark:bg-[#061722]/20">
                {items.length === 0 ? (
                  <div className={`h-full min-h-[160px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-colors ${
                    isTarget ? 'border-[#064420] bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}>
                    <p className="text-xs font-medium">No deliverables in {quadrant.title}</p>
                    {canEdit && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                        Drag a task here to assign it to this quadrant
                      </p>
                    )}
                  </div>
                ) : (
                  items.map((del) => {
                    const overdue = isOverdue(del.dueDate, del.status);
                    const approaching = isApproaching(del.dueDate, del.status);
                    const photo = getMemberPhoto(del.assignedToId, del.assignedToName);
                    const subtaskCount = del.subtasks?.length || 0;
                    const subtaskDone = del.subtasks?.filter((s) => s.completed).length || 0;

                    return (
                      <div
                        key={del.id}
                        draggable={canEdit}
                        onDragStart={(e) => handleDragStart(e, del.id)}
                        className={`group bg-white dark:bg-[#092638] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs transition-all ${
                          canEdit ? 'cursor-grab active:cursor-grabbing hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600' : ''
                        }`}
                      >
                        {/* Event Name Tag & Move Action */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">
                            {getEventName(del.eventId)}
                          </span>

                          <div className="flex items-center space-x-1.5">
                            {/* Drag Indicator for Admin/Editor */}
                            {canEdit && (
                              <span className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 transition-colors" title="Drag to reorder quadrant">
                                <GripVertical className="w-3.5 h-3.5" />
                              </span>
                            )}

                            {/* Quick move dropdown for accessibility */}
                            {canEdit && (
                              <select
                                value={del.urgency}
                                onChange={(e) => handleMoveQuadrant(del.id, e.target.value as EisenhowerUrgency)}
                                className="text-[10px] font-semibold py-0.5 px-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-slate-600 dark:text-slate-300 focus:outline-none"
                                title="Move to another quadrant"
                              >
                                <option value="urgent_important">Move: Do First</option>
                                <option value="not_urgent_important">Move: Schedule</option>
                                <option value="urgent_not_important">Move: Delegate</option>
                                <option value="not_urgent_not_important">Move: Backlog</option>
                              </select>
                            )}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-sm font-semibold text-[#092638] dark:text-white leading-snug">
                          {del.title}
                        </h3>

                        {del.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {del.description}
                          </p>
                        )}

                        {/* Subtasks summary bar if any */}
                        {subtaskCount > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              {subtaskDone} of {subtaskCount} sub-tasks completed
                            </span>
                            <span className="font-semibold text-xs">
                              {Math.round((subtaskDone / subtaskCount) * 100)}%
                            </span>
                          </div>
                        )}

                        {/* Meta Information Bar */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                          
                          {/* Assignee (Name & Profile Picture only - no email) */}
                          <div className="flex items-center space-x-2">
                            {photo ? (
                              <img
                                src={photo}
                                alt={del.assignedToName || 'Member'}
                                className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-[#064420] text-white flex items-center justify-center text-[10px] font-bold">
                                {del.assignedToName ? del.assignedToName.charAt(0) : '?'}
                              </div>
                            )}
                            <span className="text-xs font-medium text-[#092638] dark:text-slate-200">
                              {del.assignedToName || 'Unassigned'}
                            </span>
                          </div>

                          {/* Deadline & Flags */}
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {formatFullDate(del.dueDate)}
                            </span>
                            {overdue ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400">
                                <AlertTriangle className="w-3 h-3" /> Overdue
                              </span>
                            ) : approaching ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                <Clock className="w-3 h-3" /> Approaching
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">
                                Status: {del.status}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Google Drive Asset Indicator if linked */}
                        {del.driveLink && (
                          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                            <a
                              href={del.driveLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[160px]">{del.driveFileName || 'Drive Asset'}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-medium">
                              Drive Synced
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
