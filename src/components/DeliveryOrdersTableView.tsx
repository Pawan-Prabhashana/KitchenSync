import React from 'react';
import { Trash2, ArrowRight, ClipboardList } from 'lucide-react';
import { DeliveryOrder, DeliveryStage } from '../types';
import { getNextDeliveryStage } from '../lib/boardConfig';

interface DeliveryOrdersTableViewProps {
  orders: DeliveryOrder[];
  onSelectOrder: (order: DeliveryOrder) => void;
  onMoveStage: (orderId: string, toStage: DeliveryStage) => void;
  onDeleteOrder: (orderId: string) => void;
}

const stageColors: Record<DeliveryStage, string> = {
  'Preparing': 'bg-blue-100 text-blue-800',
  'Ready for Pickup': 'bg-amber-100 text-amber-800',
  'Out for Delivery': 'bg-indigo-100 text-indigo-800',
  'Delivered': 'bg-slate-100 text-slate-700'
};

export const DeliveryOrdersTableView: React.FC<DeliveryOrdersTableViewProps> = ({
  orders,
  onSelectOrder,
  onMoveStage,
  onDeleteOrder
}) => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">All Delivery Orders</h2>
          <p className="text-xs text-slate-500 mt-0.5">List of active and completed delivery tickets</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0">
          <ClipboardList className="w-4 h-4" />
          {orders.length} total
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-xs border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="px-4 py-3 border-b border-slate-200 whitespace-nowrap">Order</th>
                <th className="px-4 py-3 border-b border-slate-200 min-w-[180px]">Customer</th>
                <th className="px-4 py-3 border-b border-slate-200 whitespace-nowrap">Stage</th>
                <th className="px-4 py-3 border-b border-slate-200 whitespace-nowrap">Rider</th>
                <th className="px-4 py-3 border-b border-slate-200 whitespace-nowrap">Payment</th>
                <th className="px-4 py-3 border-b border-slate-200 whitespace-nowrap">Total</th>
                <th className="px-4 py-3 border-b border-slate-200 whitespace-nowrap text-right min-w-[120px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const next = getNextDeliveryStage(order.stage);
                return (
                  <tr
                    key={order.id}
                    onClick={() => onSelectOrder(order)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 border-b border-slate-100 font-mono font-semibold text-slate-700 whitespace-nowrap align-middle">
                      {order.id}
                    </td>
                    <td className="px-4 py-3 border-b border-slate-100 align-middle max-w-[220px]">
                      <div className="font-semibold text-slate-800 truncate">{order.customerName}</div>
                      <div className="text-[10px] text-slate-400 truncate">{order.address}</div>
                    </td>
                    <td className="px-4 py-3 border-b border-slate-100 whitespace-nowrap align-middle">
                      <span className={`inline-flex px-2 py-0.5 rounded-md font-bold ${stageColors[order.stage]}`}>
                        {order.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b border-slate-100 text-slate-600 whitespace-nowrap align-middle">
                      {order.rider || '—'}
                    </td>
                    <td className="px-4 py-3 border-b border-slate-100 text-slate-600 whitespace-nowrap align-middle">
                      {order.paymentMethod}
                    </td>
                    <td className="px-4 py-3 border-b border-slate-100 font-mono font-bold text-slate-800 whitespace-nowrap align-middle">
                      ${order.orderTotal.toFixed(2)}
                    </td>
                    <td
                      className="px-4 py-3 border-b border-slate-100 align-middle whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center justify-end gap-2 w-full">
                        {next && (
                          <button
                            type="button"
                            onClick={() => onMoveStage(order.id, next)}
                            className="shrink-0 p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            aria-label={`Advance to ${next}`}
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteOrder(order.id)}
                          className="shrink-0 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
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
