import React from 'react';
import { ImpactEvent } from '../types';
import { Calendar, AlertCircle, Mic2, Briefcase } from 'lucide-react';

interface MarketEventsProps {
  events: ImpactEvent[];
  isLoading: boolean;
}

const MarketEvents: React.FC<MarketEventsProps> = ({ events, isLoading }) => {
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'POLITICAL': return <Mic2 size={16} className="text-purple-400" />;
      case 'ECONOMIC': return <Briefcase size={16} className="text-emerald-400" />;
      default: return <Calendar size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6 px-1">
        <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
            <Briefcase className="text-emerald-400" size={20} />
        </div>
        <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Economic & Political Data</h2>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">High Impact Events</p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
        {isLoading ? (
            <div className="p-8 space-y-4">
                {[1,2,3].map(i => (
                    <div key={i} className="animate-pulse flex gap-4">
                        <div className="w-16 h-16 bg-white/5 rounded-lg"></div>
                        <div className="flex-1 space-y-2 py-2">
                            <div className="h-4 bg-white/5 rounded w-2/3"></div>
                            <div className="h-3 bg-white/5 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        ) : events.length === 0 ? (
            <div className="p-12 text-center opacity-50">
                <p className="text-slate-500">No major economic indicators or political events found for the upcoming week.</p>
            </div>
        ) : (
            <div className="divide-y divide-white/5">
                {events.map((event, idx) => (
                    <div key={idx} className="p-5 hover:bg-white/5 transition-all flex flex-col sm:flex-row gap-5 group">
                        {/* Date Block */}
                        <div className="shrink-0 w-full sm:w-24 bg-black/20 border border-white/5 rounded-xl flex flex-row sm:flex-col items-center justify-between sm:justify-center p-3 sm:p-0">
                            <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">{event.date.split(',')[0]}</span>
                            <span className="text-xs sm:text-sm font-bold text-white leading-tight sm:mt-1 sm:text-center">{event.date.split(',').slice(1).join(',')}</span>
                        </div>

                        {/* Event Details */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                                <h4 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors leading-tight">
                                    {event.title}
                                </h4>
                                {event.impact === 'HIGH' && (
                                    <span className="shrink-0 text-[10px] font-bold bg-rose-500/10 text-rose-400 px-2 py-1 rounded-full border border-rose-500/20 flex items-center gap-1 shadow-[0_0_10px_-3px_rgba(244,63,94,0.3)]">
                                        <AlertCircle size={10} /> HIGH
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 mt-3 mb-3">
                                {getCategoryIcon(event.category)}
                                <span className="text-xs text-slate-400 font-mono font-medium tracking-wide bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                    {event.category}
                                </span>
                            </div>

                            <p className="text-sm text-slate-400 leading-relaxed font-light">
                                {event.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default MarketEvents;