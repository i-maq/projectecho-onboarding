"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Search, Clock } from 'lucide-react';
import { format, isToday, isYesterday, addMonths, subMonths, isSameDay } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { Echo } from './dashboard';
import { toast } from 'sonner';
import { GlassCard } from '@/components/ui/glass-card';
import { EchoButton } from '@/components/ui/echo-button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ViewMemoriesScreenProps {
  echoes: Echo[];
  onSelectDate: (date: Date) => void;
  onBack: () => void;
  isLoading: boolean;
}

export function ViewMemoriesScreen({
  echoes,
  onSelectDate,
  onBack,
  isLoading,
}: ViewMemoriesScreenProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());

  const handleDaySelect = (date?: Date) => {
    if (date) { setSelectedDate(date); setCalendarOpen(false); }
  };

  const handleViewMemories = () => {
    if (selectedDate) {
      const memoriesForDate = echoes.filter(echo => isSameDay(new Date(echo.created_at), selectedDate));
      if (memoriesForDate.length === 0) {
        toast.info('No memories found for this date');
      } else {
        onSelectDate(selectedDate);
      }
    }
  };

  const formatDisplayDate = (date?: Date): string => {
    if (!date) return 'Select a date';
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  const datesWithMemories = echoes.map(echo => new Date(echo.created_at));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col space-y-6 overflow-y-auto">
      <GlassCard variant="strong" className="flex-grow overflow-y-auto shadow-echo-elevated">
        <h2 className="text-2xl font-bold text-echo-text-primary mb-6">Visit a Memory</h2>

        {/* Date Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-echo-text-primary mb-3">Choose a Date</h3>
          <div className="relative">
            <button
              onClick={() => setCalendarOpen(prev => !prev)}
              className="echo-input w-full py-3 px-4 text-left flex justify-between items-center cursor-pointer"
            >
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-3 text-echo-purple-600" />
                <span>{formatDisplayDate(selectedDate)}</span>
              </div>
              <ChevronRight className={`h-5 w-5 text-echo-text-muted transition-transform ${calendarOpen ? 'rotate-90' : ''}`} />
            </button>

            {calendarOpen && (
              <div className="absolute z-10 mt-2 w-full glass-panel-strong rounded-xl shadow-echo-elevated p-3">
                <div className="flex justify-between items-center mb-2">
                  <button onClick={() => setMonth(subMonths(month, 1))} className="p-1 rounded-full hover:bg-echo-purple-50">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h4 className="font-medium text-echo-text-primary">{format(month, 'MMMM yyyy')}</h4>
                  <button onClick={() => setMonth(addMonths(month, 1))} className="p-1 rounded-full hover:bg-echo-purple-50">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDaySelect}
                  month={month}
                  onMonthChange={setMonth}
                  modifiers={{ hasMemory: datesWithMemories }}
                  modifiersStyles={{
                    hasMemory: { color: '#fff', backgroundColor: '#8b5cf6', fontWeight: 'bold' },
                  }}
                  styles={{
                    caption: { color: '#4a4a68' },
                    day: { margin: '0.2em' },
                  }}
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <EchoButton variant="primary" onClick={handleViewMemories}>
              <Search className="h-4 w-4 mr-2 inline" />
              View Memories for This Day
            </EchoButton>
          </div>
        </div>

        {/* Recent Dates */}
        <div className="mt-8 overflow-y-auto">
          <h3 className="text-lg font-semibold text-echo-text-primary mb-4 flex items-center">
            <Clock className="h-5 w-5 text-echo-purple-600 mr-2" />
            Recent Days with Memories
          </h3>

          {isLoading ? (
            <div className="flex justify-center py-8"><LoadingSpinner /></div>
          ) : datesWithMemories.length > 0 ? (
            <div className="space-y-3">
              {Array.from(new Set(datesWithMemories.map(date => date.toDateString())))
                .map(dateString => new Date(dateString))
                .sort((a, b) => b.getTime() - a.getTime())
                .slice(0, 5)
                .map((date, index) => {
                  const memoriesCount = echoes.filter(echo =>
                    new Date(echo.created_at).toDateString() === date.toDateString()
                  ).length;
                  return (
                    <motion.div
                      key={date.toISOString()}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onSelectDate(date)}
                      className="echo-input flex justify-between items-center py-3 px-4 cursor-pointer hover:border-echo-purple-300 transition-colors"
                    >
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 mr-3 text-echo-purple-600" />
                        <div>
                          <div className="font-medium text-echo-text-primary">
                            {isToday(date) ? 'Today' : isYesterday(date) ? 'Yesterday' : format(date, 'MMMM d, yyyy')}
                          </div>
                          <div className="text-xs text-echo-text-muted">
                            {memoriesCount} {memoriesCount === 1 ? 'memory' : 'memories'}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-echo-text-muted" />
                    </motion.div>
                  );
                })}
            </div>
          ) : (
            <GlassCard className="text-center !p-6">
              <CalendarIcon className="h-12 w-12 text-echo-text-muted mx-auto mb-4" />
              <p className="text-echo-text-muted">No memories found. Start by creating your first memory!</p>
            </GlassCard>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
