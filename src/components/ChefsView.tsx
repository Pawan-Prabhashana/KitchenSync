import React from 'react';
import { ChefHat, Flame, CheckCircle, Clock } from 'lucide-react';
import { Order, Stage } from '../types';
import { DEMO_USERS } from '../data/menu';

interface ChefsViewProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
}

export const ChefsView: React.FC<ChefsViewProps> = ({ orders, onSelectOrder }) => {
  const chefs = DEMO_USERS.filter(u => u.role === 'chef');

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Kitchen Staff Workload</h2>
          <p className="text-xs text-slate-500">Active chef assignments and cooking queue</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {chefs.map(chef => {
          const activeOrders = orders.filter(o => o.chef === chef.name && o.stage !== 'Served');
          const cookingOrders = activeOrders.filter(o => o.stage === 'Cooking');
          const readyOrders = activeOrders.filter(o => o.stage === 'Ready');
          const servedCount = orders.filter(o => o.chef === chef.name && o.stage === 'Served').length;

          return (
            <div key={chef.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              {/* Chef Header */}
              <div className="flex items-center gap-3">
                <img src={chef.avatar} alt={chef.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/20" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{chef.name}</h3>
                  <div className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    On Duty (Chef)
                  </div>
                </div>
              </div>

              {/* Workload Stats */}
              <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Cooking</div>
                  <div className="text-base font-black text-amber-600">{cookingOrders.length}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Ready</div>
                  <div className="text-base font-black text-emerald-600">{readyOrders.length}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Served</div>
                  <div className="text-base font-black text-slate-700">{servedCount}</div>
                </div>
              </div>

              {/* Assigned Active Orders List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Queue</h4>
                {activeOrders.length === 0 ? (
                  <div className="text-xs text-slate-400 italic py-3 text-center border border-dashed border-slate-200 rounded-xl">
                    No active orders assigned
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {activeOrders.map(order => (
                      <div
                        key={order.id}
                        onClick={() => onSelectOrder(order)}
                        className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 cursor-pointer flex items-center justify-between text-xs transition-all"
                      >
                        <div>
                          <div className="font-bold text-slate-800">{order.tableNumber} ({order.id})</div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[160px]">
                            {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          order.stage === 'Cooking' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {order.stage}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
