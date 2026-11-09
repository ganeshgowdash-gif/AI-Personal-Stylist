'use client';

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Clock,
  Trash2
} from 'lucide-react';
import { 
  format, 
  addDays, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  addWeeks, 
  subWeeks,
  isToday
} from 'date-fns';
import { useWardrobe } from '@/context/WardrobeContext';
import { ALL_OCCASIONS } from '@/lib/utils';
import { OutfitCombination } from '@/types/database';

interface CalendarViewProps {
  onOpenSuggestForDate: (date: string, occasion: string) => void;
  onOpenPreview: (outfit: OutfitCombination) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onOpenSuggestForDate,
  onOpenPreview,
}) => {
  const { 
    plannerEntries, 
    savedOutfits, 
    outfitHistory, 
    addPlannerEntry, 
    removePlannerEntry, 
    togglePlannerWorn,
    wardrobe 
  } = useWardrobe();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleOccasion, setScheduleOccasion] = useState('College');
  const [selectedOutfitId, setSelectedOutfitId] = useState<string>('');

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const selectedDateStr = format(selectedDay, 'yyyy-MM-dd');
  const entryForSelectedDay = plannerEntries.find((p) => p.planned_date === selectedDateStr);

  // Check if outfit is being repeated too soon within last 7 days
  const checkRepeatWarning = (outfitId?: string | null, dateStr?: string) => {
    if (!outfitId) return null;
    const date = dateStr ? new Date(dateStr) : new Date();

    const recentlyWorn = outfitHistory.find((h) => {
      if (h.outfit_id !== outfitId) return false;
      const hDate = new Date(h.worn_date);
      const diffDays = Math.abs(Math.floor((date.getTime() - hDate.getTime()) / (1000 * 3600 * 24)));
      return diffDays <= 6;
    });

    if (recentlyWorn) {
      return `Warning: Worn recently on ${recentlyWorn.worn_date}. Consider rotating to avoid repeating within 7 days.`;
    }
    return null;
  };

  const handleSaveSchedule = async () => {
    await addPlannerEntry({
      planned_date: selectedDateStr,
      occasion: scheduleOccasion,
      outfit_id: selectedOutfitId || undefined,
    });
    setIsScheduleModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl glass-card">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white/10 text-white">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-wide">
              {format(weekStart, 'MMMM yyyy')}
            </h2>
            <p className="text-xs text-luxury-400">
              Week of {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-luxury-300 hover:text-white border border-white/[0.08] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCurrentDate(new Date());
              setSelectedDay(new Date());
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-luxury-300 hover:text-white border border-white/[0.08] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Strip (7 Days) */}
      <div className="grid grid-cols-2 sm:grid-cols-7 gap-2.5">
        {weekDays.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isSelected = isSameDay(day, selectedDay);
          const isDayToday = isToday(day);
          const entry = plannerEntries.find((p) => p.planned_date === dateStr);

          return (
            <div
              key={dateStr}
              onClick={() => setSelectedDay(day)}
              className={`p-3.5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between min-h-[120px] ${
                isSelected
                  ? 'bg-white text-black font-semibold shadow-lg shadow-white/10 scale-[1.02]'
                  : 'glass-card border border-white/[0.06] hover:border-white/20 text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] uppercase font-mono tracking-wider ${
                    isSelected ? 'text-black/70' : 'text-luxury-400'
                  }`}
                >
                  {format(day, 'EEE')}
                </span>
                {isDayToday && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-black text-white' : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    Today
                  </span>
                )}
              </div>

              <div className="my-2">
                <span className="text-xl font-bold font-serif">{format(day, 'd')}</span>
              </div>

              <div>
                {entry ? (
                  <div
                    className={`text-[10px] font-mono truncate px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-black/10 text-black' : 'bg-white/10 text-luxury-200'
                    }`}
                  >
                    {entry.is_worn ? '✓ Worn: ' : ''}
                    {entry.occasion}
                  </div>
                ) : (
                  <span
                    className={`text-[10px] font-mono ${
                      isSelected ? 'text-black/50' : 'text-luxury-600'
                    }`}
                  >
                    Unscheduled
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Detail & Outfit Assignment */}
      <div className="p-6 rounded-3xl glass-card border border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
          <div>
            <h3 className="text-lg font-serif font-bold text-white">
              {format(selectedDay, 'EEEE, MMMM d, yyyy')}
            </h3>
            <p className="text-xs text-luxury-400 mt-0.5">
              {entryForSelectedDay
                ? `Planned for ${entryForSelectedDay.occasion}`
                : 'No outfit assigned for this day.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!entryForSelectedDay ? (
              <>
                <button
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90 transition-all shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign Outfit</span>
                </button>
                <button
                  onClick={() => onOpenSuggestForDate(selectedDateStr, 'College')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.1] transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI Auto-Suggest</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => togglePlannerWorn(entryForSelectedDay.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                    entryForSelectedDay.is_worn
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-white/[0.04] text-luxury-300 hover:text-white border-white/[0.08]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{entryForSelectedDay.is_worn ? 'Marked Worn' : 'Mark as Worn'}</span>
                </button>
                <button
                  onClick={() => removePlannerEntry(entryForSelectedDay.id)}
                  className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Selected Day's Outfit Showcase */}
        {entryForSelectedDay?.outfit ? (
          <div className="pt-6 space-y-4">
            {/* Repeat Warning Check */}
            {checkRepeatWarning(entryForSelectedDay.outfit.id, selectedDateStr) && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{checkRepeatWarning(entryForSelectedDay.outfit.id, selectedDateStr)}</span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Top', item: entryForSelectedDay.outfit.top_item },
                { label: 'Bottom', item: entryForSelectedDay.outfit.bottom_item },
                { label: 'Footwear', item: entryForSelectedDay.outfit.footwear_item },
                { label: 'Outerwear', item: entryForSelectedDay.outfit.outerwear_item },
              ]
                .filter((p) => p.item)
                .map(({ label, item }) => (
                  <div
                    key={label}
                    className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3"
                  >
                    <img
                      src={item?.photo_url}
                      alt={item?.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10"
                    />
                    <div className="overflow-hidden">
                      <span className="text-[10px] font-mono uppercase text-luxury-400 block">
                        {label}
                      </span>
                      <p className="text-xs font-semibold text-white truncate">{item?.name}</p>
                      <p className="text-[10px] text-luxury-500 capitalize">{item?.primary_color}</p>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-luxury-400 italic">
                {entryForSelectedDay.outfit.color_harmony_explanation}
              </p>
              <button
                onClick={() => onOpenPreview(entryForSelectedDay.outfit!)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white text-white hover:text-black transition-colors"
              >
                <span>View Virtual Preview</span>
              </button>
            </div>
          </div>
        ) : entryForSelectedDay ? (
          <div className="pt-6">
            <p className="text-xs text-luxury-400">
              Occasion set to <strong className="text-white">{entryForSelectedDay.occasion}</strong>.
              Click &quot;AI Auto-Suggest&quot; to pick the optimal pieces.
            </p>
          </div>
        ) : (
          <div className="pt-8 pb-4 text-center">
            <p className="text-xs text-luxury-500">
              Plan college or work outfits ahead of time to streamline your mornings and avoid repetition.
            </p>
          </div>
        )}
      </div>

      {/* Schedule Outfit Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-luxury-950 border border-white/[0.1] rounded-3xl p-6 space-y-4">
            <h4 className="text-sm font-semibold text-white">
              Schedule Outfit for {format(selectedDay, 'MMM d')}
            </h4>

            <div>
              <label className="block text-xs text-luxury-400 mb-1">Occasion</label>
              <select
                value={scheduleOccasion}
                onChange={(e) => setScheduleOccasion(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-luxury-900 border border-white/[0.1] text-xs text-white"
              >
                {ALL_OCCASIONS.map((occ) => (
                  <option key={occ} value={occ}>
                    {occ}
                  </option>
                ))}
              </select>
            </div>

            {savedOutfits.length > 0 && (
              <div>
                <label className="block text-xs text-luxury-400 mb-1">
                  Select from Saved Outfits
                </label>
                <select
                  value={selectedOutfitId}
                  onChange={(e) => setSelectedOutfitId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-luxury-900 border border-white/[0.1] text-xs text-white"
                >
                  <option value="">None (Pick later or AI suggest)</option>
                  {savedOutfits.map((s) => (
                    <option key={s.id} value={s.outfit_id}>
                      {s.custom_name || s.outfit?.title || 'Saved Outfit'} ({s.outfit?.occasion})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-luxury-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSchedule}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white text-black"
              >
                Schedule Day
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
