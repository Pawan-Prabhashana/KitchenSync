import React, { useState } from 'react';
import { Settings, Clock, Bell, Shield, RotateCcw, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [amberMinutes, setAmberMinutes] = useState<number>(8);
  const [redMinutes, setRedMinutes] = useState<number>(12);
  const [enableSoundAlerts, setEnableSoundAlerts] = useState<boolean>(true);
  const [autoArchiveServed, setAutoArchiveServed] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">KitchenSync Settings</h2>
        <p className="text-xs text-slate-500">Configure timer thresholds, alerts, and live sync rules</p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        {/* Urgency Timers Thresholds */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Kitchen Urgency Timer Thresholds</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Amber Urgency (Warning)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={amberMinutes}
                  onChange={(e) => setAmberMinutes(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <span className="text-xs font-medium text-slate-500">minutes</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Cards turn amber at ~8 min</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Red Urgency (Critical)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={redMinutes}
                  onChange={(e) => setRedMinutes(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
                <span className="text-xs font-medium text-slate-500">minutes</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Cards turn red & pulse at ~12 min</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" />
            <span>Alerts & Sound Notifications</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-slate-800">Sound chime on new order</div>
                <div className="text-[10px] text-slate-400">Play audio ping when waiters punch in a new ticket</div>
              </div>
              <input
                type="checkbox"
                checked={enableSoundAlerts}
                onChange={(e) => setEnableSoundAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-slate-800">Auto-archive served orders</div>
                <div className="text-[10px] text-slate-400">Move served orders to history tab after 1 hour</div>
              </div>
              <input
                type="checkbox"
                checked={autoArchiveServed}
                onChange={(e) => setAutoArchiveServed(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          {saved ? (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <Check className="w-4 h-4" /> Preferences saved!
            </span>
          ) : <div />}

          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};
