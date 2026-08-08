import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, Trash2, MapPin, Bike, ArrowRight, CheckCircle2, Wallet, Navigation, AlertTriangle } from 'lucide-react';
import SelectMenu from './SelectMenu';
import { DeliveryOrder, DeliveryStage, User } from '../types';
import { DEMO_RIDERS } from '../data/menu';
import { getNextDeliveryStage } from '../lib/boardConfig';
import { useUpdateFlash } from '../hooks/useUpdateFlash';

interface DeliveryOrderCardProps {
  order: DeliveryOrder;
  currentUser: User | null;
  onSelect: (order: DeliveryOrder) => void;
  onMoveStage: (orderId: string, toStage: DeliveryStage) => void;
  onAssignRider: (orderId: string, riderName: string) => void;
  onDelete: (orderId: string) => void;
  isConflict?: boolean;
  conflictBy?: string;
}

const paymentStyle: Record<DeliveryOrder['paymentMethod'], string> = {
  Cash: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Card: 'bg-blue-50 text-blue-700 border-blue-200',
  Online: 'bg-indigo-50 text-indigo-700 border-indigo-200'
};

export const DeliveryOrderCard: React.FC<DeliveryOrderCardProps> = ({
  order,
  currentUser,
  onSelect,
  onMoveStage,
  onAssignRider,
  onDelete,
  isConflict,
  conflictBy
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const flash = useUpdateFlash(order.version);

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

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      return `${pad(hrs)}:${pad(mins % 60)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const elapsedMins = elapsedSeconds / 60;

  // Lateness urgency framed around the delivery ETA window.
  let timerBadgeStyle = 'text-emerald-600 bg-emerald-50 border-emerald-100';
  let timerLabel = 'On time';
  if (elapsedMins >= order.etaMinutes * 1.25) {
    timerBadgeStyle = 'text-red-600 bg-red-50 border-red-200 font-bold animate-pulse';
    timerLabel = 'Very late';
  } else if (elapsedMins >= order.etaMinutes) {
    timerBadgeStyle = 'text-amber-600 bg-amber-50 border-amber-200 font-semibold';
    timerLabel = 'Past ETA';
  }

  const riders = DEMO_RIDERS;
  const nextStage = getNextDeliveryStage(order.stage);
  const advanceLabel =
    nextStage === 'Ready for Pickup' ? 'Ready' :
    nextStage === 'Out for Delivery' ? 'Dispatch' :
    nextStage === 'Delivered' ? 'Delivered' : '';

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', order.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Compact layout for the Delivered column.
  if (order.stage === 'Delivered') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        draggable
        onDragStart={handleDragStart}
        onClick={() => onSelect(order)}
        className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:border-slate-300"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate">{order.customerName}</div>
              <div className="text-[10px] text-slate-400">Delivered {order.deliveredAt || order.lastUpdatedAt}</div>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(order.id); }}
            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
            aria-label="Delete delivered record"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect(order)}
      className={`bg-white border rounded-xl p-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer group relative ${
        isConflict ? 'border-amber-400 ring-2 ring-amber-200' : 'border-slate-200 hover:border-indigo-300'
      }`}
    >
      {/* Live-update flash overlay */}
      {flash && (
        <motion.span
          initial={{ opacity: 0.55 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.85 }}
          className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-indigo-400 bg-indigo-400/10"
        />
      )}

      {/* Conflict ribbon */}
      {isConflict && conflictBy && (
        <div className="mb-2 -mt-0.5 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-100 border border-amber-300 text-[10px] font-bold text-amber-900">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span className="truncate">Updated by {conflictBy}</span>
        </div>
      )}

      {/* Top row: customer + order id */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm font-bold text-slate-900 truncate">{order.customerName}</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono shrink-0">{order.id}</span>
      </div>

      {/* Address + distance */}
      <div className="flex items-center gap-1.5 mb-2.5 text-[11px] text-slate-500 font-medium">
        <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span className="truncate">{order.address}</span>
        <span className="ml-auto shrink-0 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px]">
          {order.distanceKm.toFixed(1)} km
        </span>
      </div>

      {/* Items */}
      <div className="space-y-0.5 mb-3">
        {order.items.slice(0, 3).map((item, idx) => (
          <div key={idx} className="text-xs text-slate-700 font-medium">
            {item.quantity}x {item.name}
          </div>
        ))}
        {order.items.length > 3 && (
          <div className="text-[10px] text-slate-400 font-medium italic">
            +{order.items.length - 3} more item(s)...
          </div>
        )}
      </div>

      {/* Payment + total */}
      <div className="flex items-center justify-between gap-2 mb-3 text-[11px]">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-semibold ${paymentStyle[order.paymentMethod]}`}>
          <Wallet className="w-3 h-3" />
          {order.paymentMethod}
        </span>
        <span className="font-mono font-bold text-slate-800">${order.orderTotal.toFixed(2)}</span>
      </div>

      {/* Rider assignment (once out of Preparing, a rider is needed) */}
      {(!order.rider || order.stage === 'Preparing' || order.stage === 'Ready for Pickup') && (
        <div className="mb-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
            <Bike className="w-3.5 h-3.5 text-indigo-400" />
            <span>Assign rider:</span>
          </div>
          <SelectMenu
            options={[{ value: '', label: 'Select Rider' }, ...riders.map(r => ({ value: r.name, label: r.name }))]}
            value={order.rider || ''}
            onChange={(v) => onAssignRider(order.id, v)}
            placeholder="Select Rider"
            size="sm"
            renderItem={(opt) => {
              const rider = DEMO_RIDERS.find(u => u.name === opt.label);
              return (
                <div className="flex items-center gap-2">
                  {rider?.avatar ? <img src={rider.avatar} alt={rider.name} className="w-5 h-5 rounded-full object-cover" /> : null}
                  <span className="text-sm font-medium text-slate-800">{opt.label}</span>
                </div>
              );
            }}
          />
        </div>
      )}

      {order.rider && order.stage === 'Out for Delivery' && (
        <div className="mb-3 flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
          <Navigation className="w-3.5 h-3.5 text-indigo-500" />
          Rider: <strong className="text-slate-800 font-semibold">{order.rider}</strong>
        </div>
      )}

      {/* Special notes */}
      {order.specialNotes && (
        <div className="mb-3 px-2 py-1 bg-amber-50 border border-amber-200/60 rounded-md text-[10px] font-medium text-amber-900 line-clamp-1">
          📝 {order.specialNotes}
        </div>
      )}

      {/* Footer: ETA timer + advance */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-mono border ${timerBadgeStyle}`} title={`${timerLabel} · ETA ${order.etaMinutes} min`}>
          <Clock className="w-3 h-3 shrink-0" />
          <span>{formatTimer(elapsedSeconds)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {nextStage && (
            <button
              onClick={() => onMoveStage(order.id, nextStage)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-2xs active:scale-95 ${
                order.stage === 'Out for Delivery'
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}
            >
              <span>{advanceLabel}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={() => onDelete(order.id)}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Cancel / delete delivery"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
