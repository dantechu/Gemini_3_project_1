import React from 'react';
import { EarningsEvent } from '../types';
import { CalendarRange, Moon, Sun, Clock } from 'lucide-react';

interface EarningsCalendarProps {
  events: EarningsEvent[];
  isLoading: boolean;
}

const EarningsCalendar: React.FC<EarningsCalendarProps> = ({ events, isLoading }) => {
  
  // Group events by Date
  const groupedEvents = events.reduce((acc, event) => {
    const dateKey = event.date; 
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, EarningsEvent[]>);

  const dates = Object.keys(groupedEvents);

  const getTimeIcon = (time: string) => {
    if (time.toLowerCase().includes('pre')) return <Sun size={12} className="text-amber-400" />;
    if (time.toLowerCase().includes('after')) return <Moon size={12} className="text-indigo-400" />;
    return <Clock size={12} className="text-slate-500" />;
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6 px-1">
        <div className="bg-purple-500/10 p-2 rounded-lg border border-purple-500/20">
            <CalendarRange className="text-purple-400" size={20} />
        </div>
        <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Earnings Calendar</h2>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">This Week's Reports</p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl p-6">
        {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                 {[1,2,3,4,5].map(i => (
                     <div key={i} className="h-40 bg-white/5 rounded-xl animate-pulse"></div>
                 ))}
             </div>
        ) : events.length === 0 ? (
             <div className="text-center py-12 flex flex-col items-center justify-center opacity-50">
                 <CalendarRange size={48} className="text-slate-700 mb-4" />
                 <p className="text-slate-500">No major earnings scheduled for this week.</p>
             </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {dates.map((date, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-4 h-full flex flex-col hover:bg-white/10 transition-colors">
                        <h4 className="text-xs font-bold text-slate-300 border-b border-white/10 pb-2 mb-3 uppercase tracking-wider text-center font-mono">
                            {date}
                        </h4>
                        <div className="space-y-3 flex-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {groupedEvents[date].map((earning, eIdx) => (
                                <div key={eIdx} className="bg-black/20 p-3 rounded-lg border border-white/5 hover:border-purple-500/30 transition-all group">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-white group-hover:text-purple-400 transition-colors tracking-wide">{earning.ticker}</span>
                                        <div className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded text-[10px] text-slate-400 font-mono">
                                            {getTimeIcon(earning.time)}
                                            <span>{earning.time.replace('After-Close', 'PM').replace('Pre-Market', 'AM')}</span>
                                        </div>
                                    </div>
                                    <div className="text-[11px] text-slate-400 truncate">{earning.name}</div>
                                    {earning.estimate && (
                                        <div className="text-[10px] text-emerald-400/80 mt-1.5 font-mono bg-emerald-900/10 inline-block px-1.5 rounded">{earning.estimate}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default EarningsCalendar;