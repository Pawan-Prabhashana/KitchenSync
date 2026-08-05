/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { Sidebar } from './components/Sidebar';
import { Board } from './components/Board';
import { OrderDetailDrawer } from './components/OrderDetailDrawer';
import { NewOrderModal } from './components/NewOrderModal';
import { AuthModal } from './components/AuthModal';
import { ChefsView } from './components/ChefsView';
import { OrdersTableView } from './components/OrdersTableView';
import { HistoryView } from './components/HistoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { BottomStatusBar } from './components/BottomStatusBar';

import { Order, Stage, User, FilterOptions } from './types';
import { DEMO_USERS } from './data/menu';
import { INITIAL_HARDCODED_ORDERS } from './data/initialOrders';

const LOCAL_STORAGE_KEY = 'kitchensync_orders_v1';

export default function App() {
  const [route, setRoute] = useState<string>(window.location.hash || '');

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || '');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // If not authenticated, redirect to login on first load
  useEffect(() => {
    if (!currentUser && (window.location.hash === '' || window.location.hash === '#')) {
      window.location.hash = '#/login';
    }
  }, [currentUser]);
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read saved orders from localStorage');
    }
    return INITIAL_HARDCODED_ORDERS;
  });

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
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // In-memory undo history stack
  const [undoStack, setUndoStack] = useState<Array<{ orderId: string; previousStage: Stage }>>([]);

  const [lastActivity, setLastActivity] = useState<{ user: string; time: string }>({
    user: 'Priya',
    time: '2 sec ago'
  });

  // Save to localStorage when orders change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.warn('Failed to save orders to localStorage');
    }
  }, [orders]);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    window.location.hash = '';
  };

  // Handlers for user operations
  const handleMoveStage = (orderId: string, toStage: Stage) => {
    const existingOrder = orders.find(o => o.id === orderId);
    if (!existingOrder) return;

    // Save move to undo history
    setUndoStack(prev => [{ orderId, previousStage: existingOrder.stage }, ...prev.slice(0, 9)]);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedOrder: Order = {
      ...existingOrder,
      stage: toStage,
      version: existingOrder.version + 1,
      lastUpdatedAt: nowStr,
      servedAt: toStage === 'Served' ? nowStr : existingOrder.servedAt
    };

    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    setLastActivity({ user: currentUser?.name || 'Staff', time: 'just now' });

    if (selectedOrder?.id === orderId) {
      setSelectedOrder(updatedOrder);
    }
  };

  const handleAssignChef = (orderId: string, chefName: string) => {
    const existingOrder = orders.find(o => o.id === orderId);
    if (!existingOrder) return;

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedOrder: Order = {
      ...existingOrder,
      chef: chefName,
      version: existingOrder.version + 1,
      lastUpdatedAt: nowStr
    };

    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    setLastActivity({ user: currentUser?.name || 'Manager', time: 'just now' });

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
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

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
    }
  };

  const handleUndoMove = () => {
    if (undoStack.length === 0) return;

    const [lastMove, ...remainingStack] = undoStack;
    setUndoStack(remainingStack);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setOrders(prev => prev.map(o => {
      if (o.id === lastMove.orderId) {
        const reverted: Order = {
          ...o,
          stage: lastMove.previousStage,
          lastUpdatedAt: nowStr
        };
        if (selectedOrder?.id === o.id) {
          setSelectedOrder(reverted);
        }
        return reverted;
      }
      return o;
    }));
  };

    // If route is login or signup, render full-page auth routes
    if (route === '#/login') {
      return <LoginPage onAuthSuccess={handleAuthSuccess} />;
    }

    if (route === '#/signup') {
      return <SignupPage onAuthSuccess={handleAuthSuccess} />;
    }

    return (
      <div className="min-h-screen bg-slate-100/60 font-sans text-slate-800 flex flex-col antialiased">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          activeUsersCount={activeUsersCount}
          filters={filters}
          setFilters={setFilters}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
          onUndo={handleUndoMove}
          canUndo={undoStack.length > 0}
          activeTab={activeTab}
        />

        {/* Main Container */}
        <div className="flex flex-1 items-stretch">
          {/* Left Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            filters={filters}
            setFilters={setFilters}
            onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
          />

          {/* Dynamic View Area */}
          <main className="flex-1 overflow-y-auto pb-12">
            {activeTab === 'board' && (
              <Board
                orders={orders}
                currentUser={currentUser}
                filters={filters}
                onSelectOrder={(order) => setSelectedOrder(order)}
                onMoveStage={handleMoveStage}
                onAssignChef={handleAssignChef}
                onDeleteOrder={handleDeleteOrder}
                onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersTableView
                orders={orders}
                onSelectOrder={(order) => setSelectedOrder(order)}
                onMoveStage={handleMoveStage}
                onDeleteOrder={handleDeleteOrder}
              />
            )}

            {activeTab === 'chefs' && (
              <ChefsView
                orders={orders}
                onSelectOrder={(order) => setSelectedOrder(order)}
              />
            )}

            {activeTab === 'history' && (
              <HistoryView
                orders={orders}
                onSelectOrder={(order) => setSelectedOrder(order)}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView orders={orders} />
            )}

            {activeTab === 'settings' && (
              <SettingsView />
            )}
          </main>
        </div>

        {/* Right Slide-over Order Detail Drawer */}
        <OrderDetailDrawer
          order={selectedOrder}
          currentUser={currentUser}
          onClose={() => {
            setSelectedOrder(null);
          }}
          onMoveStage={handleMoveStage}
          onDeleteOrder={handleDeleteOrder}
          conflictData={null}
          onRefreshConflict={() => {}}
        />

        {/* New Order Modal */}
        {isNewOrderModalOpen && (
          <NewOrderModal
            currentUser={currentUser}
            onClose={() => setIsNewOrderModalOpen(false)}
            onSubmit={handleCreateOrder}
          />
        )}

        {/* Account / Role Switch Modal */}
        {isAuthModalOpen && (
          <AuthModal
            currentUser={currentUser}
            onClose={() => setIsAuthModalOpen(false)}
            onUserChanged={(newUser) => {
              setCurrentUser(newUser);
            }}
          />
        )}

        {/* Bottom Sync Status Bar */}
        <BottomStatusBar
          isConnected={isConnected}
          activeUsersCount={activeUsersCount}
          lastUpdatedUser={lastActivity.user}
          lastUpdatedTime={lastActivity.time}
        />
      </div>
    );
}
