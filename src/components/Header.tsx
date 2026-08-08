import React from 'react';
import { ChefHat, Bike, Search, Bell, RotateCcw, User as UserIcon, ChevronDown } from 'lucide-react';
import { User, FilterOptions, BoardType } from '../types';
import { BOARD_ACCENTS } from '../lib/boardConfig';

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
  boardType: BoardType;
  onSwitchBoard: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  filters,
  setFilters,
  onOpenAuth,
  onUndo,
  canUndo,
  activeTab,
  boardType,
  onSwitchBoard
}) => {
  const accent = BOARD_ACCENTS[boardType];
  const BoardIcon = boardType === 'kitchen' ? ChefHat : Bike;

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 shadow-xs">
      {/* Brand & Page Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl ${accent.logoBox} flex items-center justify-center shadow-xs`}>
            <BoardIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-lg tracking-tight leading-none">KitchenSync</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">{accent.subtitle}</p>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

        {/* Board switcher pill */}
        <button
          onClick={onSwitchBoard}
          title="Switch board"
          aria-label={`Current board: ${accent.label}. Click to switch boards.`}
          className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${accent.switcherChip}`}
        >
          <BoardIcon className="w-3.5 h-3.5" />
          <span>{accent.label}</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        <div className="hidden md:flex items-center gap-2">
          <h1 className="text-lg font-bold text-slate-800 capitalize">{activeTab}</h1>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${accent.livePill}`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${accent.liveDot}`} />
            Live
          </span>
        </div>
      </div>

      {/* Search & Main Action Controls */}
      <div className="flex items-center gap-2 flex-1 max-w-2xl justify-center sm:justify-end">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={boardType === 'delivery' ? 'Search deliveries...' : 'Search orders...'}
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className={`w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${accent.focusInput}`}
          />
        </div>

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

        {/* Mobile board switch */}
        <button
          onClick={onSwitchBoard}
          className={`sm:hidden inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold border ${accent.switcherChip}`}
          aria-label="Switch board"
        >
          <BoardIcon className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo last card move"
          aria-label="Undo last move"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            canUndo
              ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs active:scale-95'
              : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Undo</span>
        </button>

        <div className="relative">
          <button
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
        </div>

        <button
          onClick={onOpenAuth}
          className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all text-left"
        >
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} alt={currentUser.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200" />
          ) : (
            <div className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs ${accent.avatarFallback}`}>
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
