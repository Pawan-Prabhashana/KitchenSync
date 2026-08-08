import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutGrid,
  ClipboardList,
  Users,
  Clock,
  BarChart3,
  Settings,
  Plus,
  Filter,
  Bike
} from 'lucide-react';
import { FilterOptions, BoardType } from '../types';
import { DEMO_USERS, DEMO_RIDERS, TABLES, PAYMENT_METHODS } from '../data/menu';
import { BOARD_ACCENTS } from '../lib/boardConfig';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  onOpenNewOrder: () => void;
  boardType: BoardType;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  filters,
  setFilters,
  onOpenNewOrder,
  boardType
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const accent = BOARD_ACCENTS[boardType];
  const isDelivery = boardType === 'delivery';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
    { id: 'chefs', label: isDelivery ? 'Riders' : 'Chefs', icon: isDelivery ? Bike : Users },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const assignees = isDelivery
    ? DEMO_RIDERS
    : DEMO_USERS.filter(u => u.role === 'chef');

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

  const assigneeLabel = isDelivery ? 'Rider' : 'Chef';
  const secondaryLabel = isDelivery ? 'Payment' : 'Table';
  const secondaryOptions = isDelivery ? PAYMENT_METHODS : TABLES;

  return (
    <aside className="fixed left-0 top-[57px] w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-[calc(100vh-57px-48px)] shrink-0 p-4 justify-between z-25">
      <div className="space-y-6">
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
                    ? `${accent.navActive} shadow-2xs font-bold`
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? accent.navIcon : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 pt-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Filters</span>
            {(filters.chef !== 'all' || filters.table !== 'all' || filters.search) && (
              <button
                onClick={handleClearFilters}
                className={`text-[11px] font-medium text-slate-500 hover:opacity-80 transition-colors`}
              >
                Clear All
              </button>
            )}
          </div>

          {/* Assignee filter (chef / rider) */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">By {assigneeLabel}</label>
            <div className="relative" ref={chefRef}>
              <button
                onClick={() => { setChefOpen(v => !v); setTableOpen(false); }}
                className={`w-full text-left text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-2 transition-all flex items-center justify-between ${accent.focusInput}`}
              >
                <span className="flex items-center gap-2">
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full font-semibold text-xs ${accent.avatarFallback}`}>
                    {filters.chef === 'all' ? 'A' : filters.chef.charAt(0)}
                  </span>
                  <span className="text-sm truncate">
                    {filters.chef === 'all' ? `All ${assigneeLabel}s` : filters.chef}
                  </span>
                </span>
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {chefOpen && (
                <ul className="absolute left-0 right-0 bottom-full mb-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-30">
                  <li>
                    <button
                      onClick={() => { setFilters(prev => ({ ...prev, chef: 'all' })); setChefOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50"
                    >
                      All {assigneeLabel}s
                    </button>
                  </li>
                  {assignees.map(a => (
                    <li key={a.id}>
                      <button
                        onClick={() => { setFilters(prev => ({ ...prev, chef: a.name })); setChefOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50"
                      >
                        <img src={a.avatar} alt={a.name} className="w-5 h-5 rounded-full object-cover" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-800">{a.name}</div>
                          <div className="text-[11px] text-slate-500">{a.role}</div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Secondary filter (table / payment) */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">By {secondaryLabel}</label>
            <div className="relative" ref={tableRef}>
              <button
                onClick={() => { setTableOpen(v => !v); setChefOpen(false); }}
                className={`w-full text-left text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 transition-all flex items-center justify-between ${accent.focusInput}`}
              >
                <span className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs">
                    {filters.table === 'all' ? '#' : filters.table.charAt(0)}
                  </span>
                  <span className="truncate">
                    {filters.table === 'all' ? `All ${secondaryLabel}s` : filters.table}
                  </span>
                </span>
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {tableOpen && (
                <ul className="absolute left-0 right-0 bottom-full mb-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-30">
                  <li>
                    <button
                      onClick={() => { setFilters(prev => ({ ...prev, table: 'all' })); setTableOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50"
                    >
                      All {secondaryLabel}s
                    </button>
                  </li>
                  {secondaryOptions.map(opt => (
                    <li key={opt}>
                      <button
                        onClick={() => { setFilters(prev => ({ ...prev, table: opt })); setTableOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50"
                      >
                        <div className="w-7 text-sm font-semibold text-slate-800">{opt}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <button
            onClick={onOpenNewOrder}
            className={`w-full flex items-center justify-center gap-2 mt-4 px-4 py-2.5 font-bold text-xs rounded-xl shadow-xs hover:shadow-md transition-all active:scale-[0.98] ${accent.solidBtn}`}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{isDelivery ? 'New Delivery' : 'New Order'}</span>
          </button>
        </div>
      </div>

      <div className={`mt-1 border rounded-2xl p-3.5 flex items-center gap-3 ${
        isDelivery
          ? 'bg-indigo-50/80 border-indigo-200/80'
          : 'bg-amber-50/80 border-amber-200/80'
      }`}>
        <div className={`p-2 rounded-xl ${
          isDelivery ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
        }`}>
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <div className={`text-[10px] uppercase tracking-wider font-bold ${
            isDelivery ? 'text-indigo-800/70' : 'text-amber-800/70'
          }`}>
            {isDelivery ? 'Dispatch Time' : 'Kitchen Time'}
          </div>
          <div className={`text-sm font-black font-mono tracking-tight ${
            isDelivery ? 'text-indigo-950' : 'text-amber-950'
          }`}>
            {formattedTimeString}
          </div>
          <div className={`text-[10px] font-medium ${
            isDelivery ? 'text-indigo-800/80' : 'text-amber-800/80'
          }`}>
            {formattedDateString}
          </div>
        </div>
      </div>
    </aside>
  );
};
