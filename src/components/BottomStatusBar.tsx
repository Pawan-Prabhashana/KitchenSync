import React from 'react';
import { Wifi, Users, Clock, RefreshCcw } from 'lucide-react';

interface BottomStatusBarProps {
  isConnected: boolean;
  activeUsersCount: number;
  lastUpdatedUser?: string;
  lastUpdatedTime?: string;
}

export const BottomStatusBar: React.FC<BottomStatusBarProps> = ({
  isConnected,
  activeUsersCount,
  lastUpdatedUser,
  lastUpdatedTime
}) => {
  return (
    <footer className="bg-white border-t border-slate-200 px-4 py-2 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-20 shadow-xs">
      {/* Left: Socket connectivity status */}
      <div className="flex items-center gap-2 font-medium">
        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="text-slate-700 font-semibold">{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>

      {/* Center: Active users count & Last updated info */}
      <div className="flex items-center gap-6 font-medium">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>Active Users: <strong className="text-slate-800 font-mono">{activeUsersCount}</strong></span>
        </div>

        {lastUpdatedUser && (
          <div className="hidden sm:flex items-center gap-1.5 text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Updated by <strong className="text-slate-700">{lastUpdatedUser}</strong></span>
            <span className="text-slate-400 text-[11px]">({lastUpdatedTime || 'just now'})</span>
          </div>
        )}
      </div>

      {/* Right: Live Sync Badge */}
      <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold text-[11px]">
        <RefreshCcw className="w-3 h-3 animate-spin text-emerald-600" />
        <span>Live Sync</span>
      </div>
    </footer>
  );
};
