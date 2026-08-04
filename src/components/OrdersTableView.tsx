import React from 'react';
import { ClipboardList, ArrowUpDown, Trash2, ArrowRight } from 'lucide-react';
import { Order, Stage } from '../types';

interface OrdersTableViewProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onMoveStage: (orderId: string, toStage: Stage) => void;
  onDeleteOrder: (orderId: string) => void;
}

export const OrdersTableView: React.FC<OrdersTableViewProps> = ({
  orders,
  onSelectOrder,
  onMoveStage,
  onDeleteOrder
}) => {
  const getNextStage = (stage: Stage): Stage | null => {
    if (stage === 'New') return 'Cooking';
    if (stage === 'Cooking') return 'Ready';
    if (stage === 'Ready') return 'Served';
    return null;
  };

  const stageColors: Record<Stage, string> = {
    New: 'bg-blue-100 text-blue-800',
    Cooking: 'bg-amber-100 text-amber-800',
    Ready: 'bg-emerald-100 text-emerald-800',
    Served: 'bg-slate-100 text-slate-700'
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">All Orders Table</h2>
          <p className="text-xs text-slate-500">List of all current active and completed tickets</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
            <tr>
              <th className="p-3.5">Order ID</th>
              <th className="p-3.5">Table</th>
              <th className="p-3.5">Items Summary</th>
              <th className="p-3.5">Waiter</th>
              <th className="p-3.5">Chef</th>
              <th className="p-3.5">Placed At</th>
              <th className="p-3.5">Stage</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {orders.map(order => {
              const nextStage = getNextStage(order.stage);

              return (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-slate-900">{order.id}</td>
                  <td className="p-3.5 font-bold text-slate-800">{order.tableNumber}</td>
                  <td className="p-3.5 text-slate-700 max-w-xs truncate">
                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </td>
                  <td className="p-3.5 text-slate-600">{order.waiter}</td>
                  <td className="p-3.5 text-slate-600">{order.chef || 'Unassigned'}</td>
                  <td className="p-3.5 text-slate-500">{order.createdAt}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${stageColors[order.stage]}`}>
                      {order.stage}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => onSelectOrder(order)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                    >
                      Details
                    </button>
                    {nextStage && (
                      <button
                        onClick={() => onMoveStage(order.id, nextStage)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg inline-flex items-center gap-1"
                      >
                        <span>{nextStage}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteOrder(order.id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
