import { Order, DeliveryOrder } from '../models/types';
import { INITIAL_HARDCODED_ORDERS } from '../../src/data/initialOrders';
import { INITIAL_HARDCODED_DELIVERY_ORDERS } from '../../src/data/initialDeliveryOrders';
import { BRANCHES } from '../../src/data/branches';

/**
 * Per-branch seed data. Each branch gets its own believably-distinct copy of the
 * base fixtures: globally-unique ids (branch code prefix), shifted table numbers,
 * localized customer names, and lightly-varied item mixes — so no branch is empty
 * and each city looks different.
 */

const CODE: Record<string, string> = {
  'br-colombo': 'COL',
  'br-galle': 'GAL',
  'br-kandy': 'KAN',
  'br-jaffna': 'JAF',
  'br-negombo': 'NEG',
  'br-kurunegala': 'KUR',
  'br-anuradhapura': 'ANU',
  'br-batticaloa': 'BAT'
};

const FIRST = ['Amaya', 'Ruwan', 'Sachini', 'Menaka', 'Chathura', 'Nethmi', 'Dinuka', 'Kavya', 'Isuru', 'Tharushi', 'Lakmal', 'Sanduni'];
const LAST = ['Wijesinghe', 'Jayakody', 'Peris', 'Herath', 'Alwis', 'Rajapaksha', 'Bandara', 'Fonseka', 'Gunasekara', 'Ekanayake'];
const STREETS = ['Temple Rd', 'Lake Rd', 'Main St', 'Station Rd', 'Hospital Rd', 'Beach Rd', 'Old Market Rd', 'Fort St'];

const branchIndex = (branchId: string) => Math.max(0, BRANCHES.findIndex(b => b.id === branchId));
const code = (branchId: string) => CODE[branchId] ?? branchId.replace('br-', '').slice(0, 3).toUpperCase();

const pad2 = (n: number) => n.toString().padStart(2, '0');

function shiftTable(table: string, by: number): string {
  const m = table.match(/(\d+)/);
  if (!m) return table;
  const n = ((parseInt(m[1], 10) - 1 + by) % 20) + 1;
  return `Table ${pad2(n)}`;
}

/** Kitchen orders for a branch. */
export function seedOrdersForBranch(branchId: string): Order[] {
  const bi = branchIndex(branchId);
  const c = code(branchId);
  return structuredClone(INITIAL_HARDCODED_ORDERS).map((o, i) => {
    const order = o as Order;
    order.branchId = branchId;
    order.id = order.id.replace('#ORD-', `#ORD-${c}-`);
    order.tableNumber = shiftTable(order.tableNumber, bi);
    // Light item-mix variation on non-primary branches.
    if (bi > 0 && order.items[0]) {
      order.items[0].quantity = Math.max(1, order.items[0].quantity + ((bi + i) % 2));
    }
    order.createdAtTimestamp -= bi * 60 * 1000;
    return order;
  });
}

/** Delivery orders for a branch. */
export function seedDeliveriesForBranch(branchId: string): DeliveryOrder[] {
  const bi = branchIndex(branchId);
  const c = code(branchId);
  const city = BRANCHES[bi]?.city ?? 'Colombo';
  return structuredClone(INITIAL_HARDCODED_DELIVERY_ORDERS).map((o, i) => {
    const order = o as DeliveryOrder;
    order.branchId = branchId;
    order.id = order.id.replace('#DEL-', `#DEL-${c}-`);
    if (bi > 0) {
      const first = FIRST[(bi * 5 + i) % FIRST.length];
      const last = LAST[(bi * 3 + i) % LAST.length];
      order.customerName = `${first} ${last}`;
      const num = ((bi * 7 + i * 11) % 180) + 5;
      order.address = `${num} ${STREETS[(bi + i) % STREETS.length]}, ${city}`;
      order.distanceKm = Math.round((order.distanceKm + (bi % 4)) * 10) / 10;
    }
    order.createdAtTimestamp -= bi * 60 * 1000;
    return order;
  });
}

/** All branches' kitchen orders, flattened. */
export function seedAllOrders(): Order[] {
  return BRANCHES.flatMap(b => seedOrdersForBranch(b.id));
}

/** All branches' delivery orders, flattened. */
export function seedAllDeliveries(): DeliveryOrder[] {
  return BRANCHES.flatMap(b => seedDeliveriesForBranch(b.id));
}
