/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SelectBoardPage from './pages/SelectBoardPage';
import { Sidebar } from './components/Sidebar';
import { Board } from './components/Board';
import { DeliveryBoard } from './components/DeliveryBoard';
import { OrderDetailDrawer } from './components/OrderDetailDrawer';
import { DeliveryOrderDetailDrawer } from './components/DeliveryOrderDetailDrawer';
import { NewOrderModal } from './components/NewOrderModal';
import { NewDeliveryOrderModal } from './components/NewDeliveryOrderModal';
import { AuthModal } from './components/AuthModal';
import { ChefsView } from './components/ChefsView';
import { RidersView } from './components/RidersView';
import { OrdersTableView } from './components/OrdersTableView';
import { DeliveryOrdersTableView } from './components/DeliveryOrdersTableView';
import { HistoryView } from './components/HistoryView';
import { DeliveryHistoryView } from './components/DeliveryHistoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { DeliveryAnalyticsView } from './components/DeliveryAnalyticsView';
import { SettingsView } from './components/SettingsView';
import { BottomStatusBar } from './components/BottomStatusBar';

import {
  Order,
  Stage,
  User,
  FilterOptions,
  BoardType,
  DeliveryOrder,
  DeliveryStage,
  PaymentMethod
} from './types';
import { DEMO_USERS, DEMO_RIDERS, MENU_ITEMS } from './data/menu';
import { INITIAL_HARDCODED_ORDERS } from './data/initialOrders';
import { INITIAL_HARDCODED_DELIVERY_ORDERS } from './data/initialDeliveryOrders';
import { getNextKitchenStage, getNextDeliveryStage } from './lib/boardConfig';
import { useConflictGuard } from './hooks/useConflictGuard';

const KITCHEN_ORDERS_KEY = 'kitchensync_orders_kitchen_v1';
const DELIVERY_ORDERS_KEY = 'kitchensync_orders_delivery_v1';
const ACTIVE_BOARD_KEY = 'kitchensync_active_board_v1';
/** Migrate from the original single-board localStorage key if present. */
const LEGACY_ORDERS_KEY = 'kitchensync_orders_v1';

function loadKitchenOrders(): Order[] {
  try {
    const saved = localStorage.getItem(KITCHEN_ORDERS_KEY);
    if (saved) return JSON.parse(saved);
    const legacy = localStorage.getItem(LEGACY_ORDERS_KEY);
    if (legacy) return JSON.parse(legacy);
  } catch {
    console.warn('Could not read kitchen orders from localStorage');
  }
  return INITIAL_HARDCODED_ORDERS;
}

function loadDeliveryOrders(): DeliveryOrder[] {
  try {
    const saved = localStorage.getItem(DELIVERY_ORDERS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    console.warn('Could not read delivery orders from localStorage');
  }
  return INITIAL_HARDCODED_DELIVERY_ORDERS;
}

function loadActiveBoard(): BoardType | null {
  try {
    const saved = localStorage.getItem(ACTIVE_BOARD_KEY);
    if (saved === 'kitchen' || saved === 'delivery') return saved;
  } catch {
    /* ignore */
  }
  return null;
}

function nowTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function App() {
  const [route, setRoute] = useState<string>(window.location.hash || '');

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || '');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [boardType, setBoardType] = useState<BoardType | null>(() => loadActiveBoard());

  // If not authenticated, redirect to login on first load
  useEffect(() => {
    if (!currentUser && (window.location.hash === '' || window.location.hash === '#')) {
      window.location.hash = '#/login';
    }
  }, [currentUser]);

  // Authenticated but no board → board picker
  useEffect(() => {
    if (
      currentUser &&
      !boardType &&
      route !== '#/select-board' &&
      route !== '#/login' &&
      route !== '#/signup'
    ) {
      window.location.hash = '#/select-board';
    }
  }, [currentUser, boardType, route]);

  const [orders, setOrders] = useState<Order[]>(loadKitchenOrders);
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>(loadDeliveryOrders);

  const [activeUsersCount] = useState<number>(6);
  const [isConnected] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<string>('board');
  const [filters, setFilters] = useState<FilterOptions>({
    chef: 'all',
    table: 'all',
    search: '',
    viewMode: 'all'
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedDeliveryOrder, setSelectedDeliveryOrder] = useState<DeliveryOrder | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const [undoStack, setUndoStack] = useState<Array<{ orderId: string; previousStage: Stage }>>([]);
  const [deliveryUndoStack, setDeliveryUndoStack] = useState<
    Array<{ orderId: string; previousStage: DeliveryStage }>
  >([]);

  const [lastActivity, setLastActivity] = useState<{ user: string; time: string }>({
    user: 'Priya',
    time: '2 sec ago'
  });

  const kitchenConflict = useConflictGuard<Order>();
  const deliveryConflict = useConflictGuard<DeliveryOrder>();

  // Persist kitchen orders
  useEffect(() => {
    try {
      localStorage.setItem(KITCHEN_ORDERS_KEY, JSON.stringify(orders));
    } catch {
      console.warn('Failed to save kitchen orders to localStorage');
    }
  }, [orders]);

  // Persist delivery orders
  useEffect(() => {
    try {
      localStorage.setItem(DELIVERY_ORDERS_KEY, JSON.stringify(deliveryOrders));
    } catch {
      console.warn('Failed to save delivery orders to localStorage');
    }
  }, [deliveryOrders]);

  // Persist active board
  useEffect(() => {
    try {
      if (boardType) {
        localStorage.setItem(ACTIVE_BOARD_KEY, boardType);
      } else {
        localStorage.removeItem(ACTIVE_BOARD_KEY);
      }
    } catch {
      /* ignore */
    }
  }, [boardType]);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    // Always show the board picker after login so the user can choose Kitchen or Delivery.
    // (A previously persisted board was skipping this step.)
    setBoardType(null);
    setActiveTab('board');
    setSelectedOrder(null);
    setSelectedDeliveryOrder(null);
    kitchenConflict.clear();
    deliveryConflict.clear();
    window.location.hash = '#/select-board';
  };

  const handleSelectBoard = (board: BoardType) => {
    setBoardType(board);
    setActiveTab('board');
    setFilters({ chef: 'all', table: 'all', search: '', viewMode: 'all' });
    setSelectedOrder(null);
    setSelectedDeliveryOrder(null);
    kitchenConflict.clear();
    deliveryConflict.clear();
    window.location.hash = '';
  };

  const handleSwitchBoard = () => {
    setSelectedOrder(null);
    setSelectedDeliveryOrder(null);
    kitchenConflict.clear();
    deliveryConflict.clear();
    setBoardType(null);
    window.location.hash = '#/select-board';
  };

  // ─── Kitchen handlers ─────────────────────────────────────────────────────

  const handleMoveStage = (orderId: string, toStage: Stage) => {
    const existingOrder = orders.find(o => o.id === orderId);
    if (!existingOrder) return;
    if (!kitchenConflict.guard(existingOrder)) return;

    setUndoStack(prev => [{ orderId, previousStage: existingOrder.stage }, ...prev.slice(0, 9)]);

    const nowStr = nowTime();
    const actor = currentUser?.name || 'Staff';
    const updatedOrder: Order = {
      ...existingOrder,
      stage: toStage,
      version: existingOrder.version + 1,
      lastUpdatedBy: actor,
      lastUpdatedAt: nowStr,
      servedAt: toStage === 'Served' ? nowStr : existingOrder.servedAt,
      servedAtTimestamp: toStage === 'Served' ? Date.now() : existingOrder.servedAtTimestamp,
      history: [
        ...existingOrder.history,
        {
          id: `h_${Date.now()}`,
          stage: toStage,
          timestamp: nowStr,
          user: actor,
          role: currentUser?.role || 'waiter'
        }
      ]
    };

    setOrders(prev => prev.map(o => (o.id === orderId ? updatedOrder : o)));
    kitchenConflict.commit(updatedOrder);
    setLastActivity({ user: actor, time: 'just now' });

    if (selectedOrder?.id === orderId) {
      setSelectedOrder(updatedOrder);
    }
  };

  const handleAssignChef = (orderId: string, chefName: string) => {
    const existingOrder = orders.find(o => o.id === orderId);
    if (!existingOrder) return;
    if (!kitchenConflict.guard(existingOrder)) return;

    const nowStr = nowTime();
    const actor = currentUser?.name || 'Manager';
    const updatedOrder: Order = {
      ...existingOrder,
      chef: chefName,
      version: existingOrder.version + 1,
      lastUpdatedBy: actor,
      lastUpdatedAt: nowStr
    };

    setOrders(prev => prev.map(o => (o.id === orderId ? updatedOrder : o)));
    kitchenConflict.commit(updatedOrder);
    setLastActivity({ user: actor, time: 'just now' });

    if (selectedOrder?.id === orderId) {
      setSelectedOrder(updatedOrder);
    }
  };

  const handleCreateOrder = (orderData: {
    tableNumber: string;
    items: Array<{ id: string; name: string; quantity: number }>;
    specialNotes: string;
    waiterName: string;
    chefName?: string;
  }) => {
    const nowStr = nowTime();
    const newId = `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const waiterName = orderData.waiterName || currentUser?.name || 'Waiter';

    const newOrder: Order = {
      id: newId,
      tableNumber: orderData.tableNumber,
      items: orderData.items,
      stage: 'New',
      createdAt: nowStr,
      createdAtTimestamp: Date.now(),
      waiter: waiterName,
      chef: orderData.chefName,
      specialNotes: orderData.specialNotes,
      lastUpdatedBy: waiterName,
      lastUpdatedAt: nowStr,
      version: 1,
      history: [
        {
          id: `h_${Date.now()}`,
          stage: 'New',
          timestamp: nowStr,
          user: waiterName,
          role: currentUser?.role || 'waiter'
        }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);
    setLastActivity({ user: newOrder.waiter, time: 'just now' });
    setIsNewOrderModalOpen(false);
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(null);
      kitchenConflict.clear();
    }
  };

  const handleUndoMove = () => {
    if (undoStack.length === 0) return;
    const [lastMove, ...remainingStack] = undoStack;
    setUndoStack(remainingStack);
    const nowStr = nowTime();

    setOrders(prev =>
      prev.map(o => {
        if (o.id !== lastMove.orderId) return o;
        const reverted: Order = {
          ...o,
          stage: lastMove.previousStage,
          version: o.version + 1,
          lastUpdatedBy: currentUser?.name || 'Staff',
          lastUpdatedAt: nowStr
        };
        kitchenConflict.commit(reverted);
        if (selectedOrder?.id === o.id) setSelectedOrder(reverted);
        return reverted;
      })
    );
  };

  const handleSelectKitchenOrder = (order: Order) => {
    setSelectedOrder(order);
    kitchenConflict.track(order);
  };

  const handleRefreshKitchenConflict = () => {
    if (!selectedOrder) return;
    const latest = orders.find(o => o.id === selectedOrder.id);
    if (latest) {
      setSelectedOrder(latest);
      kitchenConflict.resolve(latest);
    }
  };

  /**
   * Demo-only: mutate the open order as if a teammate (Nuwan) advanced / reassigned
   * it. Bumps version + lastUpdatedBy WITHOUT updating the user's baseline, so the
   * next user action trips the conflict guard. Swap this for a Socket.io
   * `order:updated` handler later — same raise()/version path.
   */
  const handleSimulateKitchenConflict = (orderId: string) => {
    const existing = orders.find(o => o.id === orderId);
    if (!existing) return;

    const teammate = DEMO_USERS.find(u => u.name !== currentUser?.name && u.role === 'chef')
      || DEMO_USERS[1];
    const nowStr = nowTime();
    const nextStage = getNextKitchenStage(existing.stage) || existing.stage;

    const simulated: Order = {
      ...existing,
      stage: nextStage,
      chef: existing.chef || teammate.name,
      version: existing.version + 1,
      lastUpdatedBy: teammate.name,
      lastUpdatedAt: nowStr,
      servedAt: nextStage === 'Served' ? nowStr : existing.servedAt,
      history: [
        ...existing.history,
        {
          id: `h_sim_${Date.now()}`,
          stage: nextStage,
          timestamp: nowStr,
          user: teammate.name,
          role: teammate.role
        }
      ]
    };

    setOrders(prev => prev.map(o => (o.id === orderId ? simulated : o)));
    // Do NOT update selectedOrder or commit — baseline stays stale so the next
    // user action conflicts. Raise immediately so the banner/ribbon appear.
    kitchenConflict.raise({
      orderId: simulated.id,
      updatedBy: simulated.lastUpdatedBy,
      updatedAt: simulated.lastUpdatedAt
    });
    setLastActivity({ user: teammate.name, time: 'just now' });
  };

  // ─── Delivery handlers ────────────────────────────────────────────────────

  const handleMoveDeliveryStage = (orderId: string, toStage: DeliveryStage) => {
    const existing = deliveryOrders.find(o => o.id === orderId);
    if (!existing) return;
    if (!deliveryConflict.guard(existing)) return;

    setDeliveryUndoStack(prev => [
      { orderId, previousStage: existing.stage },
      ...prev.slice(0, 9)
    ]);

    const nowStr = nowTime();
    const actor = currentUser?.name || 'Staff';
    const updated: DeliveryOrder = {
      ...existing,
      stage: toStage,
      version: existing.version + 1,
      lastUpdatedBy: actor,
      lastUpdatedAt: nowStr,
      deliveredAt: toStage === 'Delivered' ? nowStr : existing.deliveredAt,
      deliveredAtTimestamp: toStage === 'Delivered' ? Date.now() : existing.deliveredAtTimestamp,
      history: [
        ...existing.history,
        {
          id: `dh_${Date.now()}`,
          stage: toStage,
          timestamp: nowStr,
          user: actor,
          role: currentUser?.role || 'rider'
        }
      ]
    };

    setDeliveryOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
    deliveryConflict.commit(updated);
    setLastActivity({ user: actor, time: 'just now' });

    if (selectedDeliveryOrder?.id === orderId) {
      setSelectedDeliveryOrder(updated);
    }
  };

  const handleAssignRider = (orderId: string, riderName: string) => {
    const existing = deliveryOrders.find(o => o.id === orderId);
    if (!existing) return;
    if (!deliveryConflict.guard(existing)) return;

    const nowStr = nowTime();
    const actor = currentUser?.name || 'Dispatcher';
    const updated: DeliveryOrder = {
      ...existing,
      rider: riderName,
      version: existing.version + 1,
      lastUpdatedBy: actor,
      lastUpdatedAt: nowStr
    };

    setDeliveryOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
    deliveryConflict.commit(updated);
    setLastActivity({ user: actor, time: 'just now' });

    if (selectedDeliveryOrder?.id === orderId) {
      setSelectedDeliveryOrder(updated);
    }
  };

  const handleCreateDeliveryOrder = (data: {
    customerName: string;
    address: string;
    distanceKm: number;
    items: Array<{ id: string; name: string; quantity: number }>;
    paymentMethod: PaymentMethod;
    specialNotes: string;
    riderName?: string;
  }) => {
    const nowStr = nowTime();
    const newId = `#DEL-${Math.floor(2000 + Math.random() * 9000)}`;
    const actor = currentUser?.name || 'Staff';

    const orderTotal = data.items.reduce((sum, item) => {
      const menu = MENU_ITEMS.find(m => m.id === item.id);
      return sum + (menu?.price || 0) * item.quantity;
    }, 0);

    const newOrder: DeliveryOrder = {
      id: newId,
      customerName: data.customerName,
      address: data.address,
      distanceKm: data.distanceKm,
      items: data.items,
      specialNotes: data.specialNotes,
      stage: 'Preparing',
      rider: data.riderName,
      paymentMethod: data.paymentMethod,
      orderTotal,
      etaMinutes: Math.max(25, Math.round(25 + data.distanceKm * 2.5)),
      createdAt: nowStr,
      createdAtTimestamp: Date.now(),
      lastUpdatedBy: actor,
      lastUpdatedAt: nowStr,
      version: 1,
      history: [
        {
          id: `dh_${Date.now()}`,
          stage: 'Preparing',
          timestamp: nowStr,
          user: actor,
          role: currentUser?.role || 'waiter'
        }
      ]
    };

    setDeliveryOrders(prev => [newOrder, ...prev]);
    setLastActivity({ user: actor, time: 'just now' });
    setIsNewOrderModalOpen(false);
  };

  const handleDeleteDeliveryOrder = (orderId: string) => {
    setDeliveryOrders(prev => prev.filter(o => o.id !== orderId));
    if (selectedDeliveryOrder?.id === orderId) {
      setSelectedDeliveryOrder(null);
      deliveryConflict.clear();
    }
  };

  const handleUndoDeliveryMove = () => {
    if (deliveryUndoStack.length === 0) return;
    const [lastMove, ...remaining] = deliveryUndoStack;
    setDeliveryUndoStack(remaining);
    const nowStr = nowTime();

    setDeliveryOrders(prev =>
      prev.map(o => {
        if (o.id !== lastMove.orderId) return o;
        const reverted: DeliveryOrder = {
          ...o,
          stage: lastMove.previousStage,
          version: o.version + 1,
          lastUpdatedBy: currentUser?.name || 'Staff',
          lastUpdatedAt: nowStr
        };
        deliveryConflict.commit(reverted);
        if (selectedDeliveryOrder?.id === o.id) setSelectedDeliveryOrder(reverted);
        return reverted;
      })
    );
  };

  const handleSelectDeliveryOrder = (order: DeliveryOrder) => {
    setSelectedDeliveryOrder(order);
    deliveryConflict.track(order);
  };

  const handleRefreshDeliveryConflict = () => {
    if (!selectedDeliveryOrder) return;
    const latest = deliveryOrders.find(o => o.id === selectedDeliveryOrder.id);
    if (latest) {
      setSelectedDeliveryOrder(latest);
      deliveryConflict.resolve(latest);
    }
  };

  const handleSimulateDeliveryConflict = (orderId: string) => {
    const existing = deliveryOrders.find(o => o.id === orderId);
    if (!existing) return;

    const teammate =
      DEMO_RIDERS.find(u => u.name !== currentUser?.name) ||
      DEMO_USERS.find(u => u.name !== currentUser?.name) ||
      DEMO_RIDERS[0];
    const nowStr = nowTime();
    const nextStage = getNextDeliveryStage(existing.stage) || existing.stage;

    const simulated: DeliveryOrder = {
      ...existing,
      stage: nextStage,
      rider: existing.rider || teammate.name,
      version: existing.version + 1,
      lastUpdatedBy: teammate.name,
      lastUpdatedAt: nowStr,
      deliveredAt: nextStage === 'Delivered' ? nowStr : existing.deliveredAt,
      history: [
        ...existing.history,
        {
          id: `dh_sim_${Date.now()}`,
          stage: nextStage,
          timestamp: nowStr,
          user: teammate.name,
          role: teammate.role
        }
      ]
    };

    setDeliveryOrders(prev => prev.map(o => (o.id === orderId ? simulated : o)));
    deliveryConflict.raise({
      orderId: simulated.id,
      updatedBy: simulated.lastUpdatedBy,
      updatedAt: simulated.lastUpdatedAt
    });
    setLastActivity({ user: teammate.name, time: 'just now' });
  };

  // ─── Routes ───────────────────────────────────────────────────────────────

  if (route === '#/login') {
    return <LoginPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (route === '#/signup') {
    return <SignupPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (route === '#/select-board' || (currentUser && !boardType)) {
    return <SelectBoardPage currentUser={currentUser} onSelect={handleSelectBoard} />;
  }

  // Guard: no user → login (hash effect handles redirect, but avoid flash)
  if (!currentUser || !boardType) {
    return null;
  }

  const isDelivery = boardType === 'delivery';
  const canUndo = isDelivery ? deliveryUndoStack.length > 0 : undoStack.length > 0;
  const onUndo = isDelivery ? handleUndoDeliveryMove : handleUndoMove;

  const kitchenConflictData =
    kitchenConflict.conflict && selectedOrder?.id === kitchenConflict.conflict.orderId
      ? { updatedBy: kitchenConflict.conflict.updatedBy, updatedAt: kitchenConflict.conflict.updatedAt }
      : null;

  const deliveryConflictData =
    deliveryConflict.conflict && selectedDeliveryOrder?.id === deliveryConflict.conflict.orderId
      ? { updatedBy: deliveryConflict.conflict.updatedBy, updatedAt: deliveryConflict.conflict.updatedAt }
      : null;

  return (
    <div className="min-h-screen bg-slate-100/60 font-sans text-slate-800 flex flex-col antialiased">
      <Header
        currentUser={currentUser}
        activeUsersCount={activeUsersCount}
        filters={filters}
        setFilters={setFilters}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
        onUndo={onUndo}
        canUndo={canUndo}
        activeTab={activeTab}
        boardType={boardType}
        onSwitchBoard={handleSwitchBoard}
      />

      <div className="flex flex-1 items-stretch">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filters={filters}
          setFilters={setFilters}
          onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
          boardType={boardType}
        />

        <main className="flex-1 overflow-y-auto pb-12 ml-64">
          {activeTab === 'board' && !isDelivery && (
            <Board
              orders={orders}
              currentUser={currentUser}
              filters={filters}
              onSelectOrder={handleSelectKitchenOrder}
              onMoveStage={handleMoveStage}
              onAssignChef={handleAssignChef}
              onDeleteOrder={handleDeleteOrder}
              onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
              conflict={kitchenConflict.conflict}
            />
          )}

          {activeTab === 'board' && isDelivery && (
            <DeliveryBoard
              orders={deliveryOrders}
              currentUser={currentUser}
              filters={filters}
              onSelectOrder={handleSelectDeliveryOrder}
              onMoveStage={handleMoveDeliveryStage}
              onAssignRider={handleAssignRider}
              onDeleteOrder={handleDeleteDeliveryOrder}
              onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
              conflict={deliveryConflict.conflict}
            />
          )}

          {activeTab === 'orders' && !isDelivery && (
            <OrdersTableView
              orders={orders}
              onSelectOrder={handleSelectKitchenOrder}
              onMoveStage={handleMoveStage}
              onDeleteOrder={handleDeleteOrder}
            />
          )}

          {activeTab === 'orders' && isDelivery && (
            <DeliveryOrdersTableView
              orders={deliveryOrders}
              onSelectOrder={handleSelectDeliveryOrder}
              onMoveStage={handleMoveDeliveryStage}
              onDeleteOrder={handleDeleteDeliveryOrder}
            />
          )}

          {activeTab === 'chefs' && !isDelivery && (
            <ChefsView orders={orders} onSelectOrder={handleSelectKitchenOrder} />
          )}

          {activeTab === 'chefs' && isDelivery && (
            <RidersView orders={deliveryOrders} onSelectOrder={handleSelectDeliveryOrder} />
          )}

          {activeTab === 'history' && !isDelivery && (
            <HistoryView orders={orders} onSelectOrder={handleSelectKitchenOrder} />
          )}

          {activeTab === 'history' && isDelivery && (
            <DeliveryHistoryView
              orders={deliveryOrders}
              onSelectOrder={handleSelectDeliveryOrder}
            />
          )}

          {activeTab === 'analytics' && !isDelivery && <AnalyticsView orders={orders} />}

          {activeTab === 'analytics' && isDelivery && (
            <DeliveryAnalyticsView orders={deliveryOrders} />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {!isDelivery && (
        <OrderDetailDrawer
          order={selectedOrder}
          currentUser={currentUser}
          onClose={() => {
            setSelectedOrder(null);
            kitchenConflict.clear();
          }}
          onMoveStage={handleMoveStage}
          onDeleteOrder={handleDeleteOrder}
          conflictData={kitchenConflictData}
          onRefreshConflict={handleRefreshKitchenConflict}
          onSimulateConflict={handleSimulateKitchenConflict}
        />
      )}

      {isDelivery && (
        <DeliveryOrderDetailDrawer
          order={selectedDeliveryOrder}
          currentUser={currentUser}
          onClose={() => {
            setSelectedDeliveryOrder(null);
            deliveryConflict.clear();
          }}
          onMoveStage={handleMoveDeliveryStage}
          onDeleteOrder={handleDeleteDeliveryOrder}
          conflictData={deliveryConflictData}
          onRefreshConflict={handleRefreshDeliveryConflict}
          onSimulateConflict={handleSimulateDeliveryConflict}
        />
      )}

      {isNewOrderModalOpen && !isDelivery && (
        <NewOrderModal
          currentUser={currentUser}
          onClose={() => setIsNewOrderModalOpen(false)}
          onSubmit={handleCreateOrder}
        />
      )}

      {isNewOrderModalOpen && isDelivery && (
        <NewDeliveryOrderModal
          currentUser={currentUser}
          onClose={() => setIsNewOrderModalOpen(false)}
          onSubmit={handleCreateDeliveryOrder}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          currentUser={currentUser}
          onClose={() => setIsAuthModalOpen(false)}
          onUserChanged={(newUser) => setCurrentUser(newUser)}
        />
      )}

      <BottomStatusBar
        isConnected={isConnected}
        activeUsersCount={activeUsersCount}
        lastUpdatedUser={lastActivity.user}
        lastUpdatedTime={lastActivity.time}
      />
    </div>
  );
}
