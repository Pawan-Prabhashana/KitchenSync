import React from 'react';
import { DeliveryOrder } from '../types';
import { DEMO_RIDERS } from '../data/menu';

interface RidersViewProps {
  orders: DeliveryOrder[];
  onSelectOrder: (order: DeliveryOrder) => void;
}

export const RidersView: React.FC<RidersViewProps> = ({ orders, onSelectOrder }) => {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Rider Dispatch Board</h2>
          <p className="text-xs text-slate-500">Active rider assignments and delivery queue</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DEMO_RIDERS.map(rider => {
          const active = orders.filter(o => o.rider === rider.name && o.stage !== 'Delivered');
          const outForDelivery = active.filter(o => o.stage === 'Out for Delivery');
          const pickup = active.filter(o => o.stage === 'Ready for Pickup');
          const deliveredCount = orders.filter(o => o.rider === rider.name && o.stage === 'Delivered').length;

          return (
            <div key={rider.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <img src={rider.avatar} alt={rider.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/20" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{rider.name}</h3>
                  <div className="text-xs text-indigo-700 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    On Route (Rider)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Pickup</div>
                  <div className="text-base font-black text-amber-600">{pickup.length}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">En route</div>
                  <div className="text-base font-black text-indigo-600">{outForDelivery.length}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Delivered</div>
                  <div className="text-base font-black text-slate-700">{deliveredCount}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Queue</h4>
                {active.length === 0 ? (
                  <div className="text-xs text-slate-400 italic py-3 text-center border border-dashed border-slate-200 rounded-xl">
                    No active deliveries assigned
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {active.map(order => (
                      <div
                        key={order.id}
                        onClick={() => onSelectOrder(order)}
                        className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 cursor-pointer flex items-center justify-between text-xs transition-all"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 truncate">{order.customerName} ({order.id})</div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[180px]">{order.address}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] shrink-0 ${
                          order.stage === 'Out for Delivery' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.stage === 'Out for Delivery' ? 'En route' : 'Pickup'}
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
