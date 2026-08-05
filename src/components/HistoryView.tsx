import React from 'react';
import { Clock, CheckCircle2, User, Calendar } from 'lucide-react';
import { Order } from '../types';

interface HistoryViewProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ orders, onSelectOrder }) => {
  const servedOrders = orders.filter(o => o.stage === 'Served');

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Completed Order History</h2>
          <p className="text-xs text-slate-500">Log of all served orders and stage change timestamps</p>
        </div>
        <div className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
          {servedOrders.length} Served Orders
        </div>
      </div>

      <div className="space-y-3">
        {servedOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
            No completed orders in history yet
          </div>
        ) : (
          servedOrders.map(order => (
            <div
              key={order.id}
              onClick={() => onSelectOrder(order)}
              className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-4 shadow-xs transition-all cursor-pointer flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{order.tableNumber}</span>
                    <span className="text-xs font-mono text-slate-400">({order.id})</span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium truncate max-w-md">
                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Staff</div>
                  <div className="text-slate-800 font-semibold">{order.waiter} / {order.chef || 'Chef'}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Served At</div>
                  <div className="text-slate-800 font-semibold">{order.servedAt || order.lastUpdatedAt}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
