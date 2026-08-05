import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutGrid, 
  ClipboardList, 
  Users, 
  Clock, 
  BarChart3, 
  Settings, 
  Plus, 
  X,
  Filter
} from 'lucide-react';
import { FilterOptions } from '../types';
import { DEMO_USERS, TABLES } from '../data/menu';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  onOpenNewOrder: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  filters,
  setFilters,
  onOpenNewOrder
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // close dropdowns on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (chefRef.current && !chefRef.current.contains(e.target as Node)) {
        setChefOpen(false);
      }
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        setTableOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const navItems = [
    { id: 'board', label: 'Board', icon: LayoutGrid },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'chefs', label: 'Chefs', icon: Users },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const chefs = DEMO_USERS.filter(u => u.role === 'chef');

  const chefRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLDivElement | null>(null);
  const [chefOpen, setChefOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);

  const handleClearFilters = () => {
    setFilters(prev => ({
      ...prev,
      chef: 'all',
      table: 'all',
      search: ''
    }));
  };

  const formattedTimeString = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const formattedDateString = currentTime.toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <aside className="fixed left-0 top-[57px] w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-[calc(100vh-57px-48px)] shrink-0 p-4 justify-between z-25">
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Filters Section */}
        <div className="border-t border-slate-200 pt-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Filters</span>
            {(filters.chef !== 'all' || filters.table !== 'all' || filters.search) && (
              <button
                onClick={handleClearFilters}
                className="text-[11px] font-medium text-slate-500 hover:text-emerald-600 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {/* By Chef filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">By Chef</label>
            <div className="relative" ref={chefRef}>
              <button
                onClick={() => { setChefOpen(v => !v); setTableOpen(false); }}
                className="w-full text-left text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-xs">
                    {filters.chef === 'all' ? 'A' : filters.chef.charAt(0)}
                  </span>
                  <span className="text-sm">{filters.chef === 'all' ? 'All Chefs' : filters.chef}</span>
                </span>
                <Filter className="w-4 h-4 text-slate-400" />
              </button>

              {chefOpen && (
                <ul className="absolute left-0 right-0 bottom-full mb-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-30">
                  <li>
                    <button
                      onClick={() => { setFilters(prev => ({ ...prev, chef: 'all' })); setChefOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50"
                    >All Chefs</button>
                  </li>
                  {chefs.map(c => (
                    <li key={c.id}>
                      <button
                        onClick={() => { setFilters(prev => ({ ...prev, chef: c.name })); setChefOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50"
                      >
                        <img src={c.avatar} alt={c.name} className="w-5 h-5 rounded-full object-cover" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-800">{c.name}</div>
                          <div className="text-[11px] text-slate-500">{c.role}</div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* By Table filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">By Table</label>
            <div className="relative" ref={tableRef}>
              <button
                onClick={() => { setTableOpen(v => !v); setChefOpen(false); }}
                className="w-full text-left text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs">
                    {filters.table === 'all' ? '#' : filters.table}
                  </span>
                  <span>{filters.table === 'all' ? 'All Tables' : filters.table}</span>
                </span>
                <Filter className="w-4 h-4 text-slate-400" />
              </button>

              {tableOpen && (
                <ul className="absolute left-0 right-0 bottom-full mb-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-30">
                  <li>
                    <button
                      onClick={() => { setFilters(prev => ({ ...prev, table: 'all' })); setTableOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50"
                    >All Tables</button>
                  </li>
                  {TABLES.map(table => (
                    <li key={table}>
                      <button
                        onClick={() => { setFilters(prev => ({ ...prev, table })); setTableOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50"
                      >
                        <div className="w-7 text-sm font-semibold text-slate-800">{table}</div>
                        <div className="text-[11px] text-slate-500">Table</div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* + New Order Primary Button */}
          <button
            onClick={onOpenNewOrder}
            className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Kitchen Time Digital Clock Box */}
      <div className="mt-1 bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider font-bold text-amber-800/70">Kitchen Time</div>
          <div className="text-sm font-black text-amber-950 font-mono tracking-tight">{formattedTimeString}</div>
          <div className="text-[10px] font-medium text-amber-800/80">{formattedDateString}</div>
        </div>
      </div>
    </aside>
  );
};
