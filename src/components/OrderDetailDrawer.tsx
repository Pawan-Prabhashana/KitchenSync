import React, { useState, useEffect } from 'react';
import { X, Clock, AlertTriangle, RefreshCw, Trash2, CheckCircle2, User, ChevronRight } from 'lucide-react';
import { Order, Stage, User as UserType } from '../types';

interface OrderDetailDrawerProps {
  order: Order | null;
  currentUser: UserType | null;
  onClose: () => void;
  onMoveStage: (orderId: string, toStage: Stage) => void;
  onDeleteOrder: (orderId: string) => void;
  conflictData?: { updatedBy: string; updatedAt: string } | null;
  onRefreshConflict?: () => void;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  order,
  currentUser,
  onClose,
  onMoveStage,
  onDeleteOrder,
  conflictData,
  onRefreshConflict
}) => {
  if (!order) return null;

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    const calc = () => {
      const now = Date.now();
      const created = order.createdAtTimestamp || now;
      setElapsedSeconds(Math.max(0, Math.floor((now - created) / 1000)));
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [order.createdAtTimestamp]);

  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const elapsedTimeStr = `${mins} min ${secs} sec`;

  const stages: Stage[] = ['New', 'Cooking', 'Ready', 'Served'];

  const stageBadgeColor: Record<Stage, string> = {
    New: 'bg-blue-100 text-blue-800 border-blue-200',
    Cooking: 'bg-amber-100 text-amber-800 border-amber-200',
    Ready: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Served: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-slate-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-slate-900">{order.tableNumber}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${stageBadgeColor[order.stage]}`}>
                {order.stage}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Order ID: <strong className="text-slate-700 font-mono">{order.id}</strong>
            </p>
            <p className="text-xs text-slate-400">
              Placed at {order.createdAt} ({mins} min ago)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-6 flex-1 overflow-y-auto">
          {/* Item List */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Item List</h3>
            <ul className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              {order.items.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-slate-800 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{item.quantity}x {item.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Special Notes Callout */}
          {order.specialNotes && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Special Notes</h3>
              <div className="bg-amber-50 border border-amber-200/80 p-3.5 rounded-xl text-xs font-medium text-amber-950 whitespace-pre-line leading-relaxed">
                {order.specialNotes}
              </div>
            </div>
          )}

          {/* Order Info Grid */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Order Info</h3>
            <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
              <div className="p-2.5 flex items-center justify-between">
                <span className="text-slate-500">Waiter</span>
                <span className="font-semibold text-slate-800">{order.waiter}</span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <span className="text-slate-500">Chef</span>
                <span className="font-semibold text-slate-800">{order.chef || 'Unassigned'}</span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <span className="text-slate-500">Current Stage</span>
                <span className="font-semibold text-emerald-700 capitalize flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {order.stage}
                </span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <span className="text-slate-500">Time Elapsed</span>
                <span className="font-mono font-bold text-slate-800">{elapsedTimeStr}</span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <span className="text-slate-500">Last Updated</span>
                <span className="text-slate-700 font-medium">{order.lastUpdatedAt} by {order.lastUpdatedBy}</span>
              </div>
            </div>
          </div>

          {/* Bump History Timeline */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">History</h3>
            <div className="space-y-3 relative pl-4 before:absolute before:left-[7px] before:top-1.5 before:bottom-1.5 before:w-[2px] before:bg-slate-200">
              {stages.map(stg => {
                const historyEntry = order.history.find(h => h.stage === stg);
                const isPassed = !!historyEntry;
                const isCurrent = order.stage === stg;

                return (
                  <div key={stg} className="flex items-center justify-between text-xs relative">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center -ml-[19px] bg-white ring-2 ${
                        isCurrent ? 'ring-emerald-500 bg-emerald-500' : isPassed ? 'ring-emerald-500 bg-emerald-500' : 'ring-slate-300'
                      }`}>
                        {isPassed && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                      <span className={`font-semibold ${isPassed ? 'text-slate-800' : 'text-slate-400'}`}>
                        {stg}
                      </span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {historyEntry ? `${historyEntry.timestamp} by ${historyEntry.user}` : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conflict Guard Alert Banner */}
          {conflictData && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between gap-3 text-amber-900 animate-bounce">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Just updated by {conflictData.updatedBy} — refresh to see changes</span>
              </div>
              <button
                onClick={onRefreshConflict}
                className="p-1.5 hover:bg-amber-100 rounded-lg text-amber-800 transition-colors"
                title="Refresh latest data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onDeleteOrder(order.id);
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs rounded-xl transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Cancel Order</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
