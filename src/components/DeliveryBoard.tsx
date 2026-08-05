import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';
import { DeliveryOrder, DeliveryStage, User, FilterOptions, ConflictInfo } from '../types';
import { DeliveryOrderCard } from './DeliveryOrderCard';
import { DELIVERY_STAGES } from '../lib/boardConfig';

interface DeliveryBoardProps {
  orders: DeliveryOrder[];
  currentUser: User | null;
  filters: FilterOptions;
  onSelectOrder: (order: DeliveryOrder) => void;
  onMoveStage: (orderId: string, toStage: DeliveryStage) => void;
  onAssignRider: (orderId: string, riderName: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onOpenNewOrder: () => void;
  conflict?: ConflictInfo | null;
}

const stageMeta: Record<DeliveryStage, { bgHeader: string; borderCol: string; textBadge: string }> = {
  'Preparing': {
    bgHeader: 'bg-blue-50/70 border-blue-200 text-blue-900',
    borderCol: 'border-blue-200/60',
    textBadge: 'bg-blue-100 text-blue-800'
  },
  'Ready for Pickup': {
    bgHeader: 'bg-amber-50/70 border-amber-200 text-amber-900',
    borderCol: 'border-amber-200/60',
    textBadge: 'bg-amber-100 text-amber-800'
  },
  'Out for Delivery': {
    bgHeader: 'bg-indigo-50/80 border-indigo-200 text-indigo-900',
    borderCol: 'border-indigo-200/60',
    textBadge: 'bg-indigo-100 text-indigo-800'
  },
  'Delivered': {
    bgHeader: 'bg-slate-100/80 border-slate-200 text-slate-800',
    borderCol: 'border-slate-200',
    textBadge: 'bg-slate-200 text-slate-700'
  }
};

export const DeliveryBoard: React.FC<DeliveryBoardProps> = ({
  orders,
  currentUser,
  filters,
  onSelectOrder,
  onMoveStage,
  onAssignRider,
  onDeleteOrder,
  onOpenNewOrder,
  conflict
}) => {
  const [dragOverColumn, setDragOverColumn] = useState<DeliveryStage | null>(null);

  const filteredOrders = orders.filter(order => {
    // Rider filter (reuses the shared `chef` filter slot).
    if (filters.chef !== 'all' && order.rider !== filters.chef) return false;
    // Payment filter (reuses the shared `table` filter slot).
    if (filters.table !== 'all' && order.paymentMethod !== filters.table) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matches =
        order.customerName.toLowerCase().includes(q) ||
        order.id.toLowerCase().includes(q) ||
        order.address.toLowerCase().includes(q) ||
        (order.rider?.toLowerCase().includes(q) ?? false) ||
        order.items.some(i => i.name.toLowerCase().includes(q));
      if (!matches) return false;
    }
    if (filters.viewMode === 'mine' && currentUser) {
      if (currentUser.role === 'rider' && order.rider !== currentUser.name) return false;
    }
    return true;
  });

  const handleDrop = (e: React.DragEvent, toStage: DeliveryStage) => {
    e.preventDefault();
    setDragOverColumn(null);
    const orderId = e.dataTransfer.getData('text/plain');
    if (orderId) onMoveStage(orderId, toStage);
  };

  return (
    <div className="p-4 flex gap-4 items-start overflow-x-auto max-w-[1800px] mx-auto w-full">
      {DELIVERY_STAGES.map(stage => {
        const meta = stageMeta[stage];
        const columnOrders = filteredOrders.filter(o => o.stage === stage);
        const isTarget = dragOverColumn === stage;

        return (
          <div
            key={stage}
            onDragOver={(e) => { e.preventDefault(); setDragOverColumn(stage); }}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={(e) => handleDrop(e, stage)}
            className={`flex flex-col rounded-2xl border ${meta.borderCol} bg-slate-50/50 p-2.5 transition-all min-h-[600px] flex-1 min-w-[280px] ${
              isTarget ? 'ring-2 ring-indigo-500 bg-indigo-50/30' : ''
            }`}
          >
            {/* Column header */}
            <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border mb-3 shadow-2xs ${meta.bgHeader}`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                <span>{stage}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${meta.textBadge}`}>
                  {columnOrders.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="space-y-3 flex-1">
              {columnOrders.length === 0 ? (
                <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium">
                  Drop orders here
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {columnOrders.map(order => (
                    <DeliveryOrderCard
                      key={order.id}
                      order={order}
                      currentUser={currentUser}
                      onSelect={onSelectOrder}
                      onMoveStage={onMoveStage}
                      onAssignRider={onAssignRider}
                      onDelete={onDeleteOrder}
                      isConflict={conflict?.orderId === order.id}
                      conflictBy={conflict?.orderId === order.id ? conflict?.updatedBy : undefined}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {stage === 'Preparing' && (
              <button
                onClick={onOpenNewOrder}
                className="mt-3 w-full border border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50 text-slate-500 hover:text-indigo-700 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Delivery</span>
              </button>
            )}

            {stage === 'Delivered' && columnOrders.length > 0 && (
              <div className="mt-3 text-center text-xs text-slate-500 font-medium py-1.5 bg-slate-100 rounded-xl">
                Delivered ({columnOrders.length})
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
