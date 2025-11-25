import React from 'react';
import { SectorData, SentimentSignal } from '../types';
import { TrendingUp, TrendingDown, Minus, RefreshCw, Clock, Trash2, Zap } from 'lucide-react';
import SentimentGauge from './SentimentGauge';

interface SectorCardProps {
  sector: SectorData;
  onRefresh: (id: string) => void;
  onClick: (id: string) => void;
  onDelete?: (id: string) => void;
}

const SectorCard: React.FC<SectorCardProps> = ({ sector, onRefresh, onClick, onDelete }) => {
  
  const getSignalStyle = (signal: SentimentSignal) => {
    switch (signal) {
      case 'BUY': return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        shadow: 'shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]',
        glow: 'group-hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.4)]'
      };
      case 'SELL': return {
        text: 'text-rose-500',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
        shadow: 'shadow-[0_0_15px_-5px_rgba(244,63,94,0.3)]',
        glow: 'group-hover:shadow-[0_0_25px_-5px_rgba(244,63,94,0.4)]'
      };
      case 'HOLD': return {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        shadow: 'shadow-[0_0_15px_-5px_rgba(245,158,11,0.2)]',
        glow: 'group-hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.3)]'
      };
      default: return {
        text: 'text-slate-400',
        bg: 'bg-slate-800/50',
        border: 'border-slate-700',
        shadow: '',
        glow: ''
      };
    }
  };

  const getSignalIcon = (signal: SentimentSignal) => {
    switch (signal) {
      case 'BUY': return <TrendingUp size={20} className="mr-1" />;
      case 'SELL': return <TrendingDown size={20} className="mr-1" />;
      case 'HOLD': return <Minus size={20} className="mr-1" />;
      default: return <Minus size={20} className="mr-1" />;
    }
  };

  const styles = getSignalStyle(sector.signal);

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className={`relative group rounded-2xl glass-panel p-5 transition-all duration-300 cursor-pointer ${styles.glow} hover:-translate-y-1`}
      onClick={() => onClick(sector.id)}
    >
      {/* Dynamic Top Border */}
      <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-${sector.signal === 'BUY' ? 'emerald' : sector.signal === 'SELL' ? 'rose' : 'amber'}-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             {sector.type === 'STOCK' && (
                 <div className="bg-slate-800 border border-slate-700 text-xs font-mono px-1.5 py-0.5 rounded text-slate-400">
                    STOCK
                 </div>
             )}
             <div className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                <Clock size={10} />
                {formatTime(sector.lastUpdated)}
             </div>
          </div>
          <h3 className="text-xl font-semibold text-white tracking-tight group-hover:text-blue-200 transition-colors">
            {sector.name}
          </h3>
        </div>
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onRefresh(sector.id);
            }}
            disabled={sector.isLoading}
            className={`p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-white/5 ${sector.isLoading ? 'animate-spin text-blue-400' : ''}`}
            title="Refresh Analysis"
          >
            <RefreshCw size={14} />
          </button>
          
          {onDelete && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(sector.id);
              }}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 transition-colors border border-white/5"
              title="Remove from Watchlist"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-end justify-between mt-4">
        <div className={`flex flex-col ${sector.isLoading ? 'opacity-50 blur-sm' : ''}`}>
          <div className={`flex items-center gap-1 font-bold text-2xl ${styles.text} filter drop-shadow-sm`}>
            {getSignalIcon(sector.signal)}
            <span className="tracking-wide">{sector.signal}</span>
          </div>
          <span className="text-xs text-slate-500 font-mono mt-1">SENTIMENT SIGNAL</span>
        </div>
        
        <div className={`relative ${sector.isLoading ? 'opacity-50 blur-sm' : ''}`}>
             <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
             <SentimentGauge score={sector.score} size={68} />
        </div>
      </div>

      {/* Loading Overlay */}
      {sector.isLoading && (
        <div className="absolute inset-0 bg-dark-950/60 flex flex-col items-center justify-center backdrop-blur-sm rounded-2xl z-10">
            <Zap size={24} className="text-blue-400 animate-bounce mb-2" />
            <span className="text-blue-300 text-xs font-mono animate-pulse tracking-widest">SCANNING DATA...</span>
        </div>
      )}
    </div>
  );
};

export default SectorCard;