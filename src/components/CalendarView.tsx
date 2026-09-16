import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { createGoogleCalendarEvent } from '../lib/workspace';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink,
  Layers,
  Loader2,
  CalendarCheck
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { events, deliverables, members } = useApp();

  // Selected view month & year (default to current date)
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calendar calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const leadingBlanks = Array.from({ length: firstDayIndex }, (_, i) => i);

  // Helper to format YYYY-MM-DD
  const formatDayString = (day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  // Deliverables & Events mapped by date
  const getItemsForDay = (dateStr: string) => {
    const dayDeliverables = deliverables.filter((d) => d.dueDate === dateStr);
    const dayEvents = events.filter((e) => e.startDate === dateStr || (e.endDate && e.startDate <= dateStr && e.endDate >= dateStr));
    return { dayDeliverables, dayEvents };
  };

  // Sync with Google Calendar with official confirmation
  const handleSyncToGoogleCalendar = async (item: { title: string; date: string; description?: string; type: 'deliverable' | 'event' }) => {
    const confirmed = window.confirm(
      `Sync "${item.title}" (${item.date}) directly to your personal Google Calendar? Reminders will be added automatically.`
    );
    if (!confirmed) return;

    try {
      setIsSyncing(true);
      setSyncStatus(`Syncing "${item.title}" to Google Calendar...`);
      const res = await createGoogleCalendarEvent({
        summary: `[COAB ${item.type === 'event' ? 'Event' : 'Deliverable'}] ${item.title}`,
        description: item.description || `Automated sync from COAB Media Tracker for ${item.title}`,
        startDateTime: `${item.date}T09:00:00`,
        endDateTime: `${item.date}T17:00:00`,
      });
      setSyncStatus(`Successfully synced to Google Calendar!`);
      setTimeout(() => setSyncStatus(null), 5000);
    } catch (err: any) {
      console.warn('Calendar sync exception:', err);
      alert(`Google Calendar synchronization note: ${err.message || 'Make sure your Google account is connected.'}`);
      setSyncStatus(null);
    } finally {
      setIsSyncing(false);
    }
  };

  const selectedItems = getItemsForDay(selectedDay);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Calendar Header with Google Calendar Sync Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#092638] dark:text-white flex items-center gap-2">
            <span>COAB Media Calendar</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#064420]/10 text-[#064420] dark:text-[#4ade80] dark:bg-[#064420]/30 font-medium">
              Google Calendar Connected
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Visual block timeline of all committee deadlines, production sprints, and college events.
          </p>
        </div>

        {/* Sync notification alert banner */}
        {syncStatus && (
          <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{syncStatus}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Main Calendar Grid Block */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0b2434] rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs p-3.5 sm:p-6">
          
          {/* Month Navigator */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-bold text-[#092638] dark:text-white flex items-center space-x-2">
              <span>{monthNames[month]}</span>
              <span className="text-slate-400 font-normal">{year}</span>
            </h2>

            <div className="flex items-center space-x-1">
              <button
                onClick={prevMonth}
                className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-[#092638] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-[#092638] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {leadingBlanks.map((b) => (
              <div key={`blank-${b}`} className="min-h-[50px] sm:min-h-[85px] rounded-xl sm:rounded-2xl bg-slate-50/40 dark:bg-slate-800/10 border border-transparent" />
            ))}

            {daysArray.map((day) => {
              const dayStr = formatDayString(day);
              const { dayDeliverables, dayEvents } = getItemsForDay(dayStr);
              const isSelected = selectedDay === dayStr;
              const hasDeliverables = dayDeliverables.length > 0;
              const hasEvents = dayEvents.length > 0;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(dayStr)}
                  className={`min-h-[50px] sm:min-h-[85px] p-1 sm:p-2 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#064420] dark:border-[#4ade80] bg-white dark:bg-[#061722] ring-2 ring-[#064420]/10 dark:ring-[#4ade80]/20 shadow-xs'
                      : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b2434] hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] sm:text-xs font-semibold ${
                      isSelected ? 'text-[#064420] dark:text-[#4ade80] font-bold' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {day}
                    </span>
                    {(hasDeliverables || hasEvents) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E1910F] shrink-0" />
                    )}
                  </div>

                  {/* Mobile Dot Indicators */}
                  <div className="flex sm:hidden items-center justify-center gap-1 mt-1">
                    {hasEvents && <span className="w-1.5 h-1.5 rounded-full bg-[#064420]" />}
                    {hasDeliverables && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                  </div>

                  {/* Desktop Visual Blocks on Calendar */}
                  <div className="hidden sm:block space-y-1 mt-1">
                    {dayEvents.slice(0, 1).map((evt) => (
                      <div
                        key={evt.id}
                        className="text-[9px] font-semibold truncate px-1.5 py-0.5 rounded-md bg-[#064420] text-white"
                        title={evt.name}
                      >
                        {evt.name}
                      </div>
                    ))}

                    {dayDeliverables.slice(0, 2).map((del) => (
                      <div
                        key={del.id}
                        className={`text-[9px] font-semibold truncate px-1.5 py-0.5 rounded-md ${
                          del.urgency === 'urgent_important'
                            ? 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30'
                            : 'bg-[#E1910F]/20 text-[#E1910F] border border-[#E1910F]/30'
                        }`}
                        title={del.title}
                      >
                        {del.title}
                      </div>
                    ))}

                    {dayDeliverables.length > 2 && (
                      <div className="text-[8px] text-slate-400 font-medium text-center">
                        +{dayDeliverables.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda & Google Calendar Action Panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0b2434] rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs p-4 sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Agenda For
                </span>
                <h3 className="text-base font-bold text-[#092638] dark:text-white">
                  {new Date(selectedDay).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h3>
              </div>
              <CalendarIcon className="w-5 h-5 text-[#064420] dark:text-[#4ade80]" />
            </div>

            <div className="mt-4 space-y-4">
              
              {/* Events for this day */}
              {selectedItems.dayEvents.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Events / Projects</span>
                  {selectedItems.dayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-3 rounded-2xl bg-[#064420]/10 border border-[#064420]/20 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#064420] dark:text-[#4ade80]">{evt.name}</span>
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#064420] text-white">
                          {evt.category}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                        Lead: {evt.leadName || 'Unassigned'}
                      </p>
                      <button
                        onClick={() => handleSyncToGoogleCalendar({
                          title: evt.name,
                          date: selectedDay,
                          description: evt.description,
                          type: 'event'
                        })}
                        disabled={isSyncing}
                        className="mt-2 inline-flex items-center space-x-1.5 text-[10px] font-semibold text-[#064420] dark:text-[#4ade80] hover:underline"
                      >
                        <CalendarCheck className="w-3.5 h-3.5" />
                        <span>Sync with Google Calendar</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Deliverables for this day */}
              {selectedItems.dayDeliverables.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Deliverables Due</span>
                  {selectedItems.dayDeliverables.map((del) => (
                    <div
                      key={del.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-[#061722]/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#092638] dark:text-white">{del.title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                          del.status === 'completed'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}>
                          {del.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Assignee: {del.assignedToName || 'Unassigned'}</span>
                        <button
                          onClick={() => handleSyncToGoogleCalendar({
                            title: del.title,
                            date: del.dueDate,
                            description: del.description,
                            type: 'deliverable'
                          })}
                          disabled={isSyncing}
                          className="inline-flex items-center space-x-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          <span>Add to Calendar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedItems.dayEvents.length === 0 && selectedItems.dayDeliverables.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No events or deliverable deadlines scheduled for this day.
                </div>
              )}
            </div>
          </div>

          {/* Eisenhower Matrix Legend Card */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-[#0b2434] border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-2.5">
            <h4 className="font-bold text-[#092638] dark:text-white uppercase tracking-wider text-[10px]">
              Eisenhower Matrix Priority Matrix
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300">
                <span className="font-bold block">Q1: Do First</span>
                <span className="text-[10px] text-red-600 dark:text-red-400">Urgent & Important</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-300">
                <span className="font-bold block">Q2: Schedule</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400">Important, Not Urgent</span>
              </div>
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-300">
                <span className="font-bold block">Q3: Delegate</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400">Urgent, Not Important</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                <span className="font-bold block">Q4: Backlog</span>
                <span className="text-[10px] text-slate-500">Not Urgent / Important</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
