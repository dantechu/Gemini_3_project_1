import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SectorData, MarketItemType, NewsItem, ImpactEvent, EarningsEvent } from './types';
import SectorCard from './components/SectorCard';
import SectorDetail from './components/SectorDetail';
import NewsFeed from './components/NewsFeed';
import MarketEvents from './components/MarketEvents'; 
import EarningsCalendar from './components/EarningsCalendar'; 
import { analyzeMarketSentiment, fetchMarketNews, fetchMarketCalendar } from './services/geminiService';
import { Activity, Search, Zap, LayoutGrid, AlertTriangle, Plus, Terminal, ChevronRight } from 'lucide-react';
import { POPULAR_STOCKS, StockDefinition } from './data/stockList';

// Initial Sectors List
const INITIAL_SECTORS: SectorData[] = [
  { id: 'tech', name: 'Technology', type: 'SECTOR', icon: 'Cpu', signal: 'UNKNOWN', score: 50, lastUpdated: null, isLoading: false, summary: 'Waiting for scan...', catalysts: { positive: [], negative: [] }, topStocks: { buy: [], sell: [] }, news: [] },
  { id: 'energy', name: 'Energy', type: 'SECTOR', icon: 'Zap', signal: 'UNKNOWN', score: 50, lastUpdated: null, isLoading: false, summary: 'Waiting for scan...', catalysts: { positive: [], negative: [] }, topStocks: { buy: [], sell: [] }, news: [] },
  { id: 'finance', name: 'Financials', type: 'SECTOR', icon: 'DollarSign', signal: 'UNKNOWN', score: 50, lastUpdated: null, isLoading: false, summary: 'Waiting for scan...', catalysts: { positive: [], negative: [] }, topStocks: { buy: [], sell: [] }, news: [] },
  { id: 'healthcare', name: 'Healthcare', type: 'SECTOR', icon: 'Heart', signal: 'UNKNOWN', score: 50, lastUpdated: null, isLoading: false, summary: 'Waiting for scan...', catalysts: { positive: [], negative: [] }, topStocks: { buy: [], sell: [] }, news: [] },
  { id: 'consumer', name: 'Consumer Disc.', type: 'SECTOR', icon: 'ShoppingBag', signal: 'UNKNOWN', score: 50, lastUpdated: null, isLoading: false, summary: 'Waiting for scan...', catalysts: { positive: [], negative: [] }, topStocks: { buy: [], sell: [] }, news: [] },
  { id: 'crypto', name: 'Crypto Assets', type: 'SECTOR', icon: 'Bitcoin', signal: 'UNKNOWN', score: 50, lastUpdated: null, isLoading: false, summary: 'Waiting for scan...', catalysts: { positive: [], negative: [] }, topStocks: { buy: [], sell: [] }, news: [] },
];

const App: React.FC = () => {
  const [sectors, setSectors] = useState<SectorData[]>(INITIAL_SECTORS);
  const [watchlist, setWatchlist] = useState<SectorData[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
  
  // News State
  const [marketNews, setMarketNews] = useState<NewsItem[]>([]);
  const [marketSummary, setMarketSummary] = useState("Initializing market stream...");
  const [isNewsLoading, setIsNewsLoading] = useState(false);
  const [lastNewsUpdate, setLastNewsUpdate] = useState(Date.now());

  // Events State
  const [economicEvents, setEconomicEvents] = useState<ImpactEvent[]>([]);
  const [earningsEvents, setEarningsEvents] = useState<EarningsEvent[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(false);

  // Stock Search State
  const [newStockInput, setNewStockInput] = useState('');
  const [filteredStocks, setFilteredStocks] = useState<StockDefinition[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check for API Key on mount
  useEffect(() => {
      if (!process.env.API_KEY) {
          setIsApiKeyMissing(true);
      }
  }, []);

  // Filter stocks logic
  useEffect(() => {
    if (newStockInput.length > 0) {
      const query = newStockInput.toLowerCase();
      const filtered = POPULAR_STOCKS.filter(stock => 
        stock.symbol.toLowerCase().includes(query) || 
        stock.name.toLowerCase().includes(query)
      ).slice(0, 8); // Limit to top 8 matches
      setFilteredStocks(filtered);
      setShowDropdown(true);
    } else {
      setFilteredStocks([]);
      setShowDropdown(false);
    }
  }, [newStockInput]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch News Logic
  const refreshNews = useCallback(async () => {
     if (isApiKeyMissing) return;
     setIsNewsLoading(true);
     try {
         const data = await fetchMarketNews();
         setMarketNews(data.news);
         setMarketSummary(data.summary);
         setLastNewsUpdate(Date.now());
     } catch (e) {
         console.error("Failed to fetch news");
     } finally {
         setIsNewsLoading(false);
     }
  }, [isApiKeyMissing]);

  // Fetch Events Logic (Economic + Earnings)
  const refreshEvents = useCallback(async () => {
    if (isApiKeyMissing) return;
    setIsEventsLoading(true);
    try {
        const data = await fetchMarketCalendar();
        setEconomicEvents(data.economic);
        setEarningsEvents(data.earnings);
    } catch (e) {
        console.error("Failed to fetch events");
    } finally {
        setIsEventsLoading(false);
    }
  }, [isApiKeyMissing]);

  // Initial Data Fetch + Interval
  useEffect(() => {
      if (!isApiKeyMissing) {
          refreshNews();
          refreshEvents();
          // Auto-refresh news every 2 minutes (120000ms)
          const newsInterval = setInterval(refreshNews, 120000);
          // Auto-refresh events every 30 minutes
          const eventsInterval = setInterval(refreshEvents, 1800000);
          
          return () => {
              clearInterval(newsInterval);
              clearInterval(eventsInterval);
          };
      }
  }, [refreshNews, refreshEvents, isApiKeyMissing]);

  const refreshItem = useCallback(async (id: string, isWatchlist: boolean, manualOverride?: { name: string, type: MarketItemType }) => {
    if (isApiKeyMissing) return;

    // Helper to update state safely
    const updateState = isWatchlist ? setWatchlist : setSectors;
    
    // Set loading state (this works even if state is stale because it's a functional update)
    updateState(prev => prev.map(s => s.id === id ? { ...s, isLoading: true, error: undefined } : s));

    // Determine what to scan
    let nameToScan = manualOverride?.name;
    let typeToScan = manualOverride?.type;

    if (!nameToScan) {
         const currentList = isWatchlist ? watchlist : sectors;
         const itemToUpdate = currentList.find(s => s.id === id);
         if (itemToUpdate) {
             nameToScan = itemToUpdate.name;
             typeToScan = itemToUpdate.type;
         }
    }

    if (!nameToScan) return;

    const queryName = typeToScan === 'STOCK' ? `${nameToScan}` : nameToScan;

    try {
      const result = await analyzeMarketSentiment(queryName, typeToScan || 'SECTOR');
      
      updateState(prev => prev.map(s => 
        s.id === id ? {
          ...s,
          isLoading: false,
          signal: result.signal,
          score: result.score,
          summary: result.summary,
          catalysts: result.catalysts,
          topStocks: result.topStocks,
          news: result.news,
          lastUpdated: Date.now()
        } : s
      ));
    } catch (error) {
      console.error(`Failed to update ${id}`, error);
      updateState(prev => prev.map(s => 
        s.id === id ? { ...s, isLoading: false, error: 'Update failed. Try again.' } : s
      ));
    }
  }, [sectors, watchlist, isApiKeyMissing]);

  const handleScanAll = () => {
      sectors.forEach((s, index) => setTimeout(() => refreshItem(s.id, false), index * 1000));
      watchlist.forEach((s, index) => setTimeout(() => refreshItem(s.id, true), (sectors.length * 1000) + (index * 1000)));
      refreshNews();
      refreshEvents();
  };

  const addStockToWatchlist = (name: string, symbol?: string) => {
     const checkName = symbol || name;
     if (watchlist.some(s => s.name.includes(checkName))) {
         alert("This stock is already in your watchlist.");
         return;
     }

     const id = `stock-${Date.now()}`;
     const displayName = symbol ? `${symbol} - ${name}` : name;
     
     const newStock: SectorData = {
      id,
      name: displayName,
      type: 'STOCK',
      icon: 'Activity',
      signal: 'UNKNOWN',
      score: 50,
      lastUpdated: null,
      isLoading: true,
      summary: 'Initializing scan...',
      catalysts: { positive: [], negative: [] },
      topStocks: { buy: [], sell: [] },
      news: []
    };

    setWatchlist(prev => [...prev, newStock]);
    setNewStockInput('');
    setShowDropdown(false);
    setTimeout(() => { refreshItem(id, true, { name: displayName, type: 'STOCK' }); }, 100);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStockInput.trim()) return;
    addStockToWatchlist(newStockInput.trim());
  };

  const handleSelectStock = (stock: StockDefinition) => {
      addStockToWatchlist(stock.name, stock.symbol);
  };

  const handleRemoveStock = (id: string) => {
    setWatchlist(prev => prev.filter(s => s.id !== id));
  };

  const getSelectedItem = () => {
    return sectors.find(s => s.id === selectedSectorId) || watchlist.find(s => s.id === selectedSectorId) || null;
  };

  return (
    <div className="min-h-screen text-slate-200 font-sans pb-20 selection:bg-blue-500/30">
      
      {/* Glass Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/5 bg-dark-950/80 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
              <Activity size={24} className="text-white" />
            </div>
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white leading-none">
                MarketSense <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 font-mono">AI</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-1">Real-time Sentiment Engine</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {!isApiKeyMissing && (
                <button 
                  onClick={handleScanAll}
                  className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl text-sm font-bold text-white transition-all shadow-[0_0_20px_-5px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.6)] active:scale-95"
                >
                  <Zap size={16} fill="currentColor" />
                  FULL SCAN
                </button>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 pt-28 pb-12">
        
        {isApiKeyMissing && (
            <div className="mb-8 p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-4 text-rose-200 backdrop-blur-sm">
                <div className="p-3 bg-rose-500/20 rounded-full">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-lg">Missing API Key</h3>
                    <p className="text-sm opacity-80">The <code>process.env.API_KEY</code> is not configured. The sentiment engine cannot fetch real-time data.</p>
                </div>
            </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN: Main Dashboard */}
          <div className="flex-1 space-y-12 min-w-0">
            {/* Sectors Section */}
            <div>
                <div className="flex items-center gap-3 mb-6 px-1">
                    <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                        <LayoutGrid className="text-blue-400" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Sector Intelligence</h2>
                        <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Global Market Overview</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {sectors.map(sector => (
                    <SectorCard 
                    key={sector.id} 
                    sector={sector} 
                    onRefresh={(id) => refreshItem(id, false)}
                    onClick={setSelectedSectorId}
                    />
                ))}
                </div>
            </div>

            {/* Watchlist Section */}
            <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 px-1">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                            <Terminal className="text-emerald-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Custom Watchlist</h2>
                            <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Targeted Asset Scanning</p>
                        </div>
                    </div>

                    {/* Stock Search Input with Dropdown */}
                    <div className="relative w-full md:w-96 group" ref={dropdownRef}>
                        <form onSubmit={handleManualSubmit} className="flex gap-2 w-full">
                            <div className="relative flex-grow">
                                <input 
                                    type="text" 
                                    value={newStockInput}
                                    onChange={(e) => setNewStockInput(e.target.value)}
                                    onFocus={() => newStockInput && setShowDropdown(true)}
                                    placeholder="SEARCH TICKER (e.g. NVDA)"
                                    className="w-full bg-dark-900/50 border border-white/10 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500/50 focus:bg-dark-900 transition-all placeholder:text-slate-600 font-mono text-sm uppercase"
                                />
                                <Search className="absolute left-3 top-3.5 text-slate-600 group-focus-within:text-blue-400 transition-colors" size={16} />
                            </div>
                            <button 
                                type="submit"
                                disabled={!newStockInput.trim() || isApiKeyMissing}
                                className="bg-white/5 hover:bg-blue-600 hover:text-white text-slate-400 p-3 rounded-xl transition-all disabled:opacity-30 border border-white/5"
                            >
                                <Plus size={20} />
                            </button>
                        </form>

                        {/* Autocomplete Dropdown */}
                        {showDropdown && filteredStocks.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-dark-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto backdrop-blur-xl">
                                <ul>
                                    {filteredStocks.map((stock) => (
                                        <li 
                                            key={stock.symbol}
                                            onClick={() => handleSelectStock(stock)}
                                            className="px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 flex justify-between items-center group transition-colors"
                                        >
                                            <div>
                                                <span className="font-bold text-white block font-mono">{stock.symbol}</span>
                                                <span className="text-xs text-slate-500 group-hover:text-slate-300">{stock.name}</span>
                                            </div>
                                            <ChevronRight size={14} className="text-slate-700 group-hover:text-blue-400" />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {watchlist.length === 0 ? (
                    <div className="glass-panel border-dashed border-white/10 rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center">
                        <Terminal size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium text-slate-400">Watchlist Empty</p>
                        <p className="text-sm">Search for a stock symbol above to initialize a targeted scan.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                        {watchlist.map(stock => (
                            <SectorCard 
                            key={stock.id} 
                            sector={stock} 
                            onRefresh={(id) => refreshItem(id, true)}
                            onClick={setSelectedSectorId}
                            onDelete={handleRemoveStock}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Earnings Calendar Section - Full Width */}
            <div className="pt-8 border-t border-white/5">
                 <EarningsCalendar events={earningsEvents} isLoading={isEventsLoading} />
            </div>

            {/* Economic & Political Data Section - Full Width */}
            <div className="pt-8 border-t border-white/5">
                 <MarketEvents events={economicEvents} isLoading={isEventsLoading} />
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar (News Only) */}
          <div className="w-full lg:w-96 shrink-0">
             <div className="sticky top-28 h-[calc(100vh-140px)]">
                <NewsFeed 
                    news={marketNews} 
                    summary={marketSummary} 
                    isLoading={isNewsLoading} 
                    onRefresh={refreshNews} 
                    lastUpdated={lastNewsUpdate}
                />
             </div>
          </div>

        </div>
      </main>

      {/* Detail Modal */}
      {selectedSectorId && (
        <SectorDetail 
          sector={getSelectedItem()} 
          onClose={() => setSelectedSectorId(null)} 
        />
      )}
    </div>
  );
};

export default App;