import React from 'react';
import { ChefHat, Search, Bell, RotateCcw, Filter, User as UserIcon, Wifi } from 'lucide-react';
import { User, FilterOptions } from '../types';

interface HeaderProps {
  currentUser: User | null;
  activeUsersCount: number;
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  onOpenAuth: () => void;
  onOpenNewOrder: () => void;
  onUndo: () => void;
  canUndo: boolean;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeUsersCount,
  filters,
  setFilters,
  onOpenAuth,
  onUndo,
  canUndo,
  activeTab
}) => {
  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 shadow-xs">
      {/* Brand & Page Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-lg tracking-tight leading-none">KitchenSync</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Real-time Kitchen Board</p>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

        <div className="hidden sm:flex items-center gap-2">
          <h1 className="text-lg font-bold text-slate-800 capitalize">{activeTab} Board</h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>
      </div>

      {/* Search & Main Action Controls */}
      <div className="flex items-center gap-2 flex-1 max-w-2xl justify-center sm:justify-end">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* View mode toggle */}
        <div className="hidden md:flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium border border-slate-200">
          <button
            onClick={() => setFilters(prev => ({ ...prev, viewMode: 'all' }))}
            className={`px-2.5 py-1 rounded-md transition-all ${
              filters.viewMode === 'all'
                ? 'bg-white text-slate-800 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setFilters(prev => ({ ...prev, viewMode: 'mine' }))}
            className={`px-2.5 py-1 rounded-md transition-all ${
              filters.viewMode === 'mine'
                ? 'bg-white text-slate-800 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            My Orders
          </button>
        </div>

        {/* Undo Move Button */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo last card move"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            canUndo
              ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs active:scale-95'
              : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Undo</span>
        </button>

        {/* Notification indicator */}
        <div className="relative">
          <button className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
        </div>

        {/* Active User profile & Switch User Button */}

        <button
          onClick={onOpenAuth}
          className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all text-left"
        >
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} alt={currentUser.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
              {currentUser?.name ? currentUser.name.charAt(0) : <UserIcon className="w-3.5 h-3.5" />}
            </div>
          )}
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-slate-800 leading-tight">
              {currentUser ? currentUser.name : 'Select User'}
            </div>
            <div className="text-[10px] text-slate-500 capitalize font-medium">
              {currentUser ? currentUser.role : 'Guest'}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
};
