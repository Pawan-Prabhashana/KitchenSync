import React from 'react';
import { Trash2, ArrowRight } from 'lucide-react';
import { Order, Stage } from '../types';
import { getNextKitchenStage } from '../lib/boardConfig';

interface OrdersTableViewProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onMoveStage: (orderId: string, toStage: Stage) => void;
  onDeleteOrder: (orderId: string) => void;
}

const stageColors: Record<Stage, string> = {
  New: 'bg-blue-100 text-blue-800',
  Cooking: 'bg-amber-100 text-amber-800',
  Ready: 'bg-emerald-100 text-emerald-800',
  Served: 'bg-slate-100 text-slate-700'
};

export const OrdersTableView: React.FC<OrdersTableViewProps> = ({
  orders,
  onSelectOrder,
  onMoveStage,
  onDeleteOrder
}) => {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">All Orders Table</h2>
        <p className="text-xs text-slate-500 mt-0.5">List of all current active and completed tickets</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] table-fixed text-left text-xs border-collapse">
            <colgroup>
              <col className="w-[12%]" />
              <col className="w-[10%]" />
              <col className="w-[22%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[10%]" />
              <col className="w-[8%]" />
              <col className="w-[14%]" />
            </colgroup>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="px-4 py-3 align-middle font-bold">Order ID</th>
                <th className="px-4 py-3 align-middle font-bold">Table</th>
                <th className="px-4 py-3 align-middle font-bold">Items Summary</th>
                <th className="px-4 py-3 align-middle font-bold">Waiter</th>
                <th className="px-4 py-3 align-middle font-bold">Chef</th>
                <th className="px-4 py-3 align-middle font-bold">Placed At</th>
                <th className="px-4 py-3 align-middle font-bold">Stage</th>
                <th className="px-4 py-3 align-middle font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map(order => {
                const nextStage = getNextKitchenStage(order.stage);

                return (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 align-middle font-mono font-bold text-slate-900 whitespace-nowrap">
                      {order.id}
                    </td>
                    <td className="px-4 py-3 align-middle font-bold text-slate-800 whitespace-nowrap">
                      {order.tableNumber}
                    </td>
                    <td className="px-4 py-3 align-middle text-slate-700">
                      <span className="block truncate" title={order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}>
                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-slate-600">
                      <span className="block truncate">{order.waiter}</span>
                    </td>
                    <td className="px-4 py-3 align-middle text-slate-600">
                      <span className="block truncate">{order.chef || 'Unassigned'}</span>
                    </td>
                    <td className="px-4 py-3 align-middle text-slate-500 whitespace-nowrap">
                      {order.createdAt}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className={`inline-flex px-2.5 py-1 rounded-full font-bold text-[10px] ${stageColors[order.stage]}`}>
                        {order.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        <button
                          onClick={() => onSelectOrder(order)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                        >
                          Details
                        </button>
                        {nextStage && (
                          <button
                            onClick={() => onMoveStage(order.id, nextStage)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg inline-flex items-center gap-1"
                          >
                            <span>{nextStage}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteOrder(order.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                          aria-label="Delete order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
