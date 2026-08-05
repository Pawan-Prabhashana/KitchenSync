export type Role = 'waiter' | 'chef' | 'admin';

export type Stage = 'New' | 'Cooking' | 'Ready' | 'Served';

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar?: string;
  email: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
}

export interface OrderHistoryItem {
  id: string;
  stage: Stage;
  timestamp: string;
  user: string;
  role: Role;
}

export interface Order {
  id: string;
  tableNumber: string;
  items: OrderItem[];
  specialNotes?: string;
  stage: Stage;
  waiter: string;
  chef?: string;
  createdAt: string;
  createdAtTimestamp: number;
  servedAt?: string;
  servedAtTimestamp?: number;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
  version: number;
  history: OrderHistoryItem[];
}

export interface FilterOptions {
  chef: string;
  table: string;
  search: string;
  viewMode: 'all' | 'mine';
}

export interface UndoMove {
  orderId: string;
  fromStage: Stage;
  toStage: Stage;
  orderStateBefore: Order;
  timestamp: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'Mains' | 'Appetizers' | 'Drinks' | 'Desserts';
  price: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ConflictNotification {
  orderId: string;
  tableNumber: string;
  updatedBy: string;
  updatedAt: string;
}
