import React, { useState, useEffect } from 'react';
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

  const navItems = [
    { id: 'board', label: 'Board', icon: LayoutGrid },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'chefs', label: 'Chefs', icon: Users },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const chefs = DEMO_USERS.filter(u => u.role === 'chef');

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
            <select
              value={filters.chef}
              onChange={(e) => setFilters(prev => ({ ...prev, chef: e.target.value }))}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              <option value="all">All Chefs</option>
              {chefs.map(chef => (
                <option key={chef.id} value={chef.name}>
                  {chef.name}
                </option>
              ))}
            </select>
          </div>

          {/* By Table filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">By Table</label>
            <select
              value={filters.table}
              onChange={(e) => setFilters(prev => ({ ...prev, table: e.target.value }))}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              <option value="all">All Tables</option>
              {TABLES.map(table => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </select>
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
