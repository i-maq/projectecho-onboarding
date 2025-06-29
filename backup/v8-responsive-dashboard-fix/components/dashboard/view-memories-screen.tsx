"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Search, Clock } from 'lucide-react';
import { format, isToday, isYesterday, addMonths, subMonths, isSameDay, parse, isValid } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { Echo } from './dashboard';
import { toast } from 'sonner';

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
  isLoading 
}: ViewMemoriesScreenProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  
  const toggleCalendar = () => {
    setCalendarOpen(prev => !prev);
  };

  const handleDaySelect = (date?: Date) => {
    if (date) {
      setSelectedDate(date);
      setCalendarOpen(false);
    }
  };

  const handleViewMemories = () => {
    if (selectedDate) {
      // Check if there are any memories for the selected date
      const memoriesForDate = echoes.filter(echo => {
        const echoDate = new Date(echo.created_at);
        return isSameDay(echoDate, selectedDate);
      });
      
      if (memoriesForDate.length === 0) {
        toast.info('No memories found for this date');
      } else {
        onSelectDate(selectedDate);
      }
    }
  };

  const handleNext = () => {
    setMonth(addMonths(month, 1));
  };

  const handlePrev = () => {
    setMonth(subMonths(month, 1));
  };

  const formatDisplayDate = (date?: Date): string => {
    if (!date) return 'Select a date';
    
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    
    return format(date, 'MMMM d, yyyy');
  };

  // Get dates that have memories
  const datesWithMemories = echoes.map(echo => new Date(echo.created_at));
  
  const isDayWithMemory = (day: Date) => {
    return datesWithMemories.some(date => isSameDay(date, day));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col space-y-6 overflow-y-auto"
    >
      <div className="glass-panel-light !bg-white/90 !shadow-xl rounded-2xl flex-grow overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Visit a Memory</h2>

        {/* Date Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Choose a Date</h3>
          
          <div className="relative">
            {/* Date display button */}
            <button
              onClick={toggleCalendar}
              className="neumorphic-button-light w-full py-3 px-4 text-left flex justify-between items-center"
            >
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-3 text-purple-600" />
                <span>{formatDisplayDate(selectedDate)}</span>
              </div>
              <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${calendarOpen ? 'rotate-90' : ''}`} />
            </button>
            
            {/* Calendar dropdown */}
            {calendarOpen && (
              <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 p-3">
                <div className="flex justify-between items-center mb-2">
                  <button
                    onClick={handlePrev}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h4 className="font-medium">{format(month, 'MMMM yyyy')}</h4>
                  <button
                    onClick={handleNext}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDaySelect}
                  month={month}
                  onMonthChange={setMonth}
                  modifiers={{
                    hasMemory: datesWithMemories
                  }}
                  modifiersStyles={{
                    hasMemory: { 
                      color: '#fff', 
                      backgroundColor: '#8b5cf6',
                      fontWeight: 'bold'
                    }
                  }}
                  styles={{
                    caption: { color: '#4b5563' },
                    day: { margin: '0.2em' }
                  }}
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleViewMemories}
              className="neumorphic-button-light bg-purple-600 text-white shadow-lg hover:bg-purple-700 text-button px-6 py-2.5"
            >
              <Search className="h-4 w-4 mr-2 inline" />
              View Memories for This Day
            </button>
          </div>
        </div>

        {/* Recent Dates with Memories */}
        <div className="mt-8 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="h-5 w-5 text-purple-600 mr-2" />
            Recent Days with Memories
          </h3>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
          ) : datesWithMemories.length > 0 ? (
            <div className="space-y-3">
              {/* Group and sort dates, show only unique dates */}
              {Array.from(new Set(datesWithMemories.map(date => date.toDateString())))
                .map(dateString => new Date(dateString))
                .sort((a, b) => b.getTime() - a.getTime()) // Most recent first
                .slice(0, 5) // Show only 5 most recent dates
                .map((date, index) => {
                  // Count memories for this date
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
                      className="neumorphic-button-light flex justify-between items-center py-3 px-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 mr-3 text-purple-600" />
                        <div>
                          <div className="font-medium">
                            {isToday(date) ? 'Today' : 
                             isYesterday(date) ? 'Yesterday' : 
                             format(date, 'MMMM d, yyyy')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {memoriesCount} {memoriesCount === 1 ? 'memory' : 'memories'}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </motion.div>
                  );
                })
              }
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-3">No memories found. Start by creating your first memory!</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}