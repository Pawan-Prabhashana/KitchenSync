import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';
import { Order, Stage, User, FilterOptions, ConflictInfo } from '../types';
import { OrderCard } from './OrderCard';

interface BoardProps {
  orders: Order[];
  currentUser: User | null;
  filters: FilterOptions;
  onSelectOrder: (order: Order) => void;
  onMoveStage: (orderId: string, toStage: Stage) => void;
  onAssignChef: (orderId: string, chefName: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onOpenNewOrder: () => void;
  conflict?: ConflictInfo | null;
}

export const Board: React.FC<BoardProps> = ({
  orders,
  currentUser,
  filters,
  onSelectOrder,
  onMoveStage,
  onAssignChef,
  onDeleteOrder,
  onOpenNewOrder,
  conflict
}) => {
  const [dragOverColumn, setDragOverColumn] = useState<Stage | null>(null);

  const filteredOrders = orders.filter(order => {
    if (filters.chef !== 'all' && order.chef !== filters.chef) return false;
    if (filters.table !== 'all' && order.tableNumber !== filters.table) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matches =
        order.tableNumber.toLowerCase().includes(q) ||
        order.id.toLowerCase().includes(q) ||
        order.waiter.toLowerCase().includes(q) ||
        (order.chef?.toLowerCase().includes(q) ?? false) ||
        order.items.some(i => i.name.toLowerCase().includes(q));
      if (!matches) return false;
    }
    if (filters.viewMode === 'mine' && currentUser) {
      if (currentUser.role === 'chef' && order.chef !== currentUser.name) return false;
      if (currentUser.role === 'waiter' && order.waiter !== currentUser.name) return false;
    }
    return true;
  });

  const stages: Array<{ id: Stage; label: string; bgHeader: string; borderCol: string; textBadge: string }> = [
    {
      id: 'New',
      label: 'New',
      bgHeader: 'bg-blue-50/70 border-blue-200 text-blue-900',
      borderCol: 'border-blue-200/60',
      textBadge: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'Cooking',
      label: 'Cooking',
      bgHeader: 'bg-amber-50/70 border-amber-200 text-amber-900',
      borderCol: 'border-amber-200/60',
      textBadge: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'Ready',
      label: 'Ready',
      bgHeader: 'bg-emerald-50/70 border-emerald-200 text-emerald-900',
      borderCol: 'border-emerald-200/60',
      textBadge: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'Served',
      label: 'Served',
      bgHeader: 'bg-slate-100/80 border-slate-200 text-slate-800',
      borderCol: 'border-slate-200',
      textBadge: 'bg-slate-200 text-slate-700'
    }
  ];

  const handleDrop = (e: React.DragEvent, toStage: Stage) => {
    e.preventDefault();
    setDragOverColumn(null);
    const orderId = e.dataTransfer.getData('text/plain');
    if (orderId) onMoveStage(orderId, toStage);
  };

  return (
    <div className="p-4 flex gap-4 items-start overflow-x-auto max-w-[1800px] mx-auto w-full">
      {stages.map(stage => {
        const columnOrders = filteredOrders.filter(o => o.stage === stage.id);
        const isTarget = dragOverColumn === stage.id;

        return (
          <div
            key={stage.id}
            onDragOver={(e) => { e.preventDefault(); setDragOverColumn(stage.id); }}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={(e) => handleDrop(e, stage.id)}
            className={`flex flex-col rounded-2xl border ${stage.borderCol} bg-slate-50/50 p-2.5 transition-all min-h-[600px] flex-1 min-w-[260px] ${
              isTarget ? 'ring-2 ring-emerald-500 bg-emerald-50/30' : ''
            }`}
          >
            <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border mb-3 shadow-2xs ${stage.bgHeader}`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                <span>{stage.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${stage.textBadge}`}>
                  {columnOrders.length}
                </span>
              </div>
            </div>

            <div className="space-y-3 flex-1">
              {columnOrders.length === 0 ? (
                <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium">
                  Drop orders here
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {columnOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      currentUser={currentUser}
                      onSelect={onSelectOrder}
                      onMoveStage={onMoveStage}
                      onAssignChef={onAssignChef}
                      onDelete={onDeleteOrder}
                      isConflict={conflict?.orderId === order.id}
                      conflictBy={conflict?.orderId === order.id ? conflict.updatedBy : undefined}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {stage.id === 'New' && (
              <button
                onClick={onOpenNewOrder}
                className="mt-3 w-full border border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-500 hover:text-emerald-700 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Order</span>
              </button>
            )}

            {stage.id === 'Served' && columnOrders.length > 0 && (
              <div className="mt-3 text-center text-xs text-slate-500 font-medium py-1.5 bg-slate-100 rounded-xl">
                Completed ({columnOrders.length})
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
