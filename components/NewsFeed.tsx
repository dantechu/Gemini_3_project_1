import React from 'react';
import { ExternalLink, RefreshCw, Radio } from 'lucide-react';
import { NewsItem } from '../types';

interface NewsFeedProps {
  news: NewsItem[];
  summary: string;
  isLoading: boolean;
  onRefresh: () => void;
  lastUpdated: number;
}

const NewsFeed: React.FC<NewsFeedProps> = ({ news, summary, isLoading, onRefresh, lastUpdated }) => {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
           <div className="relative">
             <div className="absolute inset-0 bg-red-500 blur-sm rounded-full animate-pulse"></div>
             <Radio size={16} className="text-white relative z-10" />
           </div>
           <h3 className="font-bold text-white tracking-widest text-xs uppercase font-mono">Market Wire</h3>
        </div>
        <button 
           onClick={onRefresh}
           disabled={isLoading}
           className={`p-1.5 rounded-lg hover:bg-white/10 text-slate-400 transition-colors ${isLoading ? 'animate-spin' : ''}`}
        >
            <RefreshCw size={14} />
        </button>
      </div>

      {/* Market Pulse Summary */}
      <div className="p-5 bg-gradient-to-b from-blue-500/10 to-transparent border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 blur-3xl rounded-full -mr-10 -mt-10"></div>
        <span className="text-[10px] uppercase font-mono text-blue-400 mb-2 block tracking-wider">Market Pulse</span>
        <p className="text-sm text-slate-200 leading-relaxed font-light relative z-10">
          "{summary}"
        </p>
      </div>

      {/* News List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
         {news.length === 0 && !isLoading ? (
             <div className="flex flex-col items-center justify-center h-40 text-slate-600">
                 <Radio size={24} className="mb-2 opacity-50" />
                 <p className="text-xs font-mono">Awaiting Signals...</p>
             </div>
         ) : (
             news.map((item, idx) => (
                 <a 
                    key={idx} 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block group p-3 rounded-lg hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
                 >
                    <div className="flex justify-between items-start gap-2 mb-1">
                        <span className="text-[10px] text-blue-400 font-mono bg-blue-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            {item.source || 'WEB'}
                        </span>
                        <ExternalLink size={10} className="text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                    <h4 className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                        {item.title}
                    </h4>
                 </a>
             ))
         )}
         
         {isLoading && news.length > 0 && (
             <div className="flex justify-center py-4">
                 <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce"></div>
                 <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce delay-75 mx-1"></div>
                 <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce delay-150"></div>
             </div>
         )}
      </div>

      {/* Footer / Status */}
      <div className="p-2 border-t border-white/5 bg-black/20 text-center">
          <p className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">
              Last Sync: {new Date(lastUpdated).toLocaleTimeString()}
          </p>
      </div>
    </div>
  );
};

export default NewsFeed;