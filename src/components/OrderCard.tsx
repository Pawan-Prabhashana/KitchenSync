import React, { useState, useEffect } from 'react';
import { Clock, Trash2, MoreHorizontal, CheckCircle2, User as UserIcon, ArrowRight, AlertTriangle } from 'lucide-react';
import { Order, Stage, User } from '../types';
import { DEMO_USERS } from '../data/menu';

interface OrderCardProps {
  order: Order;
  currentUser: User | null;
  onSelect: (order: Order) => void;
  onMoveStage: (orderId: string, toStage: Stage) => void;
  onAssignChef: (orderId: string, chefName: string) => void;
  onDelete: (orderId: string) => void;
  isConflict?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  currentUser,
  onSelect,
  onMoveStage,
  onAssignChef,
  onDelete,
  isConflict
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    const calculateElapsed = () => {
      const now = Date.now();
      const created = order.createdAtTimestamp || now;
      const seconds = Math.floor((now - created) / 1000);
      setElapsedSeconds(Math.max(0, seconds));
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);
    return () => clearInterval(interval);
  }, [order.createdAtTimestamp]);

  // Format mm:ss or hh:mm:ss
  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${pad(hrs)}:${pad(remMins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const elapsedMins = elapsedSeconds / 60;

  // Timer urgency color code
  let timerBadgeStyle = 'text-emerald-600 bg-emerald-50 border-emerald-100';
  if (elapsedMins >= 12) {
    timerBadgeStyle = 'text-red-600 bg-red-50 border-red-200 font-bold animate-pulse';
  } else if (elapsedMins >= 8) {
    timerBadgeStyle = 'text-amber-600 bg-amber-50 border-amber-200 font-semibold';
  }

  const chefs = DEMO_USERS.filter(u => u.role === 'chef');

  // Next stage mapping
  const getNextStage = (current: Stage): Stage | null => {
    if (current === 'New') return 'Cooking';
    if (current === 'Cooking') return 'Ready';
    if (current === 'Ready') return 'Served';
    return null;
  };

  const nextStage = getNextStage(order.stage);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', order.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Compact layout for Served column
  if (order.stage === 'Served') {
    return (
      <div
        draggable
        onDragStart={handleDragStart}
        onClick={() => onSelect(order)}
        className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:border-slate-300"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">{order.tableNumber}</div>
              <div className="text-[10px] text-slate-400">
                Served at {order.servedAt || order.lastUpdatedAt}
              </div>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(order.id);
            }}
            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
            title="Delete served record"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect(order)}
      className={`bg-white border rounded-xl p-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer group relative ${
        isConflict ? 'border-amber-400 ring-2 ring-amber-200' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Top row: Table Number & Creation Time */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-slate-900">{order.tableNumber}</span>
          <span className="text-[10px] text-slate-400 font-mono">({order.id})</span>
        </div>
        <span className="text-[11px] font-medium text-slate-400">{order.createdAt}</span>
      </div>

      {/* Item Summary List */}
      <div className="space-y-0.5 mb-3">
        {order.items.slice(0, 3).map((item, idx) => (
          <div key={idx} className="text-xs text-slate-700 font-medium flex items-center justify-between">
            <span>{item.quantity}x {item.name}</span>
          </div>
        ))}
        {order.items.length > 3 && (
          <div className="text-[10px] text-slate-400 font-medium italic">
            +{order.items.length - 3} more item(s)...
          </div>
        )}
      </div>

      {/* Waiter / Chef metadata */}
      <div className="text-[11px] text-slate-500 font-medium mb-3 flex flex-wrap items-center justify-between gap-1">
        {order.waiter && (
          <span className="flex items-center gap-1">
            <UserIcon className="w-3 h-3 text-slate-400" />
            Waiter: <strong className="text-slate-700 font-semibold">{order.waiter}</strong>
          </span>
        )}
        {order.chef ? (
          <span className="flex items-center gap-1">
            Chef: <strong className="text-slate-800 font-semibold">{order.chef}</strong>
          </span>
        ) : null}
      </div>

      {/* Chef assignment selector if unassigned or in New/Cooking */}
      {(!order.chef || order.stage === 'New') && (
        <div className="mb-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span>Assign:</span>
            <select
              value={order.chef || ''}
              onChange={(e) => onAssignChef(order.id, e.target.value)}
              className="text-[11px] bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 text-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="">Select Chef</option>
              {chefs.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Special notes snippet indicator if present */}
      {order.specialNotes && (
        <div className="mb-3 px-2 py-1 bg-amber-50 border border-amber-200/60 rounded-md text-[10px] font-medium text-amber-900 line-clamp-1">
          📝 {order.specialNotes}
        </div>
      )}

      {/* Card Footer: Live Timer + Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
        {/* Urgent Live Timer */}
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-mono border ${timerBadgeStyle}`}>
          <Clock className="w-3 h-3 shrink-0" />
          <span>{formatTimer(elapsedSeconds)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Stage advance quick action button */}
          {nextStage && (
            <button
              onClick={() => onMoveStage(order.id, nextStage)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-2xs active:scale-95 ${
                order.stage === 'Ready'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}
            >
              <span>{nextStage === 'Cooking' ? 'Start' : nextStage === 'Ready' ? 'Ready!' : 'Serve'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {/* Delete card trash button */}
          <button
            onClick={() => onDelete(order.id)}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Cancel / delete order"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
