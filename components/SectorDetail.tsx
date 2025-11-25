import React from 'react';
import { SectorData } from '../types';
import { X, ExternalLink, ArrowUpCircle, ArrowDownCircle, ThumbsUp, ThumbsDown } from 'lucide-react';

interface SectorDetailProps {
  sector: SectorData | null;
  onClose: () => void;
}

const SectorDetail: React.FC<SectorDetailProps> = ({ sector, onClose }) => {
  if (!sector) return null;

  // SVG Chart Calculations
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - sector.score / 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-dark-900 border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-dark-900/95 backdrop-blur border-b border-gray-800 p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              {sector.name} 
              <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
                 sector.signal === 'BUY' ? 'text-bullish border-bullish/30 bg-bullish/10' : 
                 sector.signal === 'SELL' ? 'text-bearish border-bearish/30 bg-bearish/10' : 
                 'text-neutral border-neutral/30 bg-neutral/10'
              }`}>
                {sector.signal}
              </span>
            </h2>
            <p className="text-gray-400 text-sm mt-1">Analysis generated via Gemini AI & Google Search Grounding</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Summary & Chart */}
          <div className="md:col-span-2 space-y-6">
            {/* AI Summary */}
            <div className="bg-dark-800 p-5 rounded-xl border border-gray-700">
              <h3 className="text-sm font-mono text-gray-400 uppercase mb-3">AI Executive Summary</h3>
              <p className="text-gray-200 leading-relaxed text-lg">
                {sector.summary}
              </p>
            </div>

            {/* Catalysts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-bullish/5 border border-bullish/20 p-4 rounded-xl">
                    <h4 className="flex items-center gap-2 text-bullish font-bold mb-3">
                        <ArrowUpCircle size={18} /> Bullish Drivers
                    </h4>
                    <ul className="space-y-2">
                        {sector.catalysts.positive.length > 0 ? sector.catalysts.positive.map((item, idx) => (
                            <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-bullish block shrink-0"></span>
                                {item}
                            </li>
                        )) : <li className="text-sm text-gray-500 italic">No specific data found.</li>}
                    </ul>
                </div>

                <div className="bg-bearish/5 border border-bearish/20 p-4 rounded-xl">
                    <h4 className="flex items-center gap-2 text-bearish font-bold mb-3">
                        <ArrowDownCircle size={18} /> Bearish Risks
                    </h4>
                    <ul className="space-y-2">
                         {sector.catalysts.negative.length > 0 ? sector.catalysts.negative.map((item, idx) => (
                            <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-bearish block shrink-0"></span>
                                {item}
                            </li>
                        )) : <li className="text-sm text-gray-500 italic">No specific data found.</li>}
                    </ul>
                </div>
            </div>

            {/* Stock Recommendations (Only for Sectors) */}
            {sector.type === 'SECTOR' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {/* Buy Recommendations */}
                <div className="bg-dark-800 border border-gray-700 p-4 rounded-xl">
                  <h4 className="flex items-center gap-2 text-white font-bold mb-3">
                    <ThumbsUp size={16} className="text-bullish" /> Top Picks (Buy)
                  </h4>
                  <div className="space-y-3">
                    {sector.topStocks.buy.length > 0 ? sector.topStocks.buy.map((stock, idx) => (
                      <div key={idx} className="bg-dark-900/50 p-2 rounded border border-gray-700/50">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-bullish">{stock.symbol}</span>
                          <span className="text-xs text-gray-400 truncate max-w-[120px]">{stock.name}</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-tight">{stock.reason}</p>
                      </div>
                    )) : <p className="text-sm text-gray-500 italic">No picks available.</p>}
                  </div>
                </div>

                {/* Sell Recommendations */}
                <div className="bg-dark-800 border border-gray-700 p-4 rounded-xl">
                  <h4 className="flex items-center gap-2 text-white font-bold mb-3">
                    <ThumbsDown size={16} className="text-bearish" /> Avoid / Sell
                  </h4>
                  <div className="space-y-3">
                    {sector.topStocks.sell.length > 0 ? sector.topStocks.sell.map((stock, idx) => (
                      <div key={idx} className="bg-dark-900/50 p-2 rounded border border-gray-700/50">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-bearish">{stock.symbol}</span>
                          <span className="text-xs text-gray-400 truncate max-w-[120px]">{stock.name}</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-tight">{stock.reason}</p>
                      </div>
                    )) : <p className="text-sm text-gray-500 italic">No picks available.</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Score & News */}
          <div className="space-y-6">
             {/* Score Visualization */}
             <div className="bg-dark-800 p-5 rounded-xl border border-gray-700 flex flex-col items-center justify-center">
                <h3 className="text-sm font-mono text-gray-400 uppercase mb-4">Sentiment Score</h3>
                <div className="h-40 w-40 relative">
                     <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {/* Background Ring (Negative Base) */}
                        <circle 
                          cx="50" cy="50" r={radius} 
                          fill="transparent" 
                          stroke="#ef4444" 
                          strokeWidth="10" 
                          opacity="0.8"
                        />
                        {/* Foreground Ring (Positive Overlay) */}
                        <circle 
                          cx="50" cy="50" r={radius} 
                          fill="transparent" 
                          stroke="#10b981" 
                          strokeWidth="10" 
                          strokeDasharray={circumference} 
                          strokeDashoffset={offset} 
                          strokeLinecap="round" 
                        />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-white">{sector.score}</span>
                        <span className="text-xs text-gray-400 font-mono">/ 100</span>
                     </div>
                </div>
                <div className="flex justify-between w-full px-4 mt-4 text-xs text-gray-500 font-mono">
                  <span className="text-bearish">BEARISH</span>
                  <span className="text-bullish">BULLISH</span>
                </div>
             </div>

             {/* News Feed */}
             <div className="bg-dark-800 p-5 rounded-xl border border-gray-700 max-h-[400px] overflow-y-auto">
                 <h3 className="text-sm font-mono text-gray-400 uppercase mb-3 flex items-center justify-between">
                     <span>Sources Scanned</span>
                     <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">Live</span>
                 </h3>
                 <div className="space-y-3">
                     {sector.news.length > 0 ? sector.news.map((news, idx) => (
                         <a 
                            key={idx} 
                            href={news.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block group border-l-2 border-transparent hover:border-blue-500 pl-3 transition-all"
                         >
                             <h5 className="text-sm text-gray-200 group-hover:text-blue-400 font-medium line-clamp-2">{news.title}</h5>
                             <div className="flex items-center gap-1 mt-1">
                                 <ExternalLink size={10} className="text-gray-500"/>
                                 <span className="text-xs text-gray-500">{news.source || 'Web Source'}</span>
                             </div>
                         </a>
                     )) : <p className="text-sm text-gray-500">No direct sources linked.</p>}
                 </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SectorDetail;