import { Stage, DeliveryStage, BoardType } from '../types';

/** Ordered kitchen stages and the forward transition between them. */
export const KITCHEN_STAGES: Stage[] = ['New', 'Cooking', 'Ready', 'Served'];
export const DELIVERY_STAGES: DeliveryStage[] = [
  'Preparing',
  'Ready for Pickup',
  'Out for Delivery',
  'Delivered'
];

export const getNextKitchenStage = (current: Stage): Stage | null => {
  const idx = KITCHEN_STAGES.indexOf(current);
  return idx >= 0 && idx < KITCHEN_STAGES.length - 1 ? KITCHEN_STAGES[idx + 1] : null;
};

export const getNextDeliveryStage = (current: DeliveryStage): DeliveryStage | null => {
  const idx = DELIVERY_STAGES.indexOf(current);
  return idx >= 0 && idx < DELIVERY_STAGES.length - 1 ? DELIVERY_STAGES[idx + 1] : null;
};

/**
 * Per-board accent theming. Tailwind v4 only emits classes it can see as
 * literal strings, so every accent variant is spelled out in full here rather
 * than composed dynamically. Kitchen keeps the existing emerald direction;
 * Delivery uses a distinct indigo accent.
 */
export interface BoardAccent {
  label: string;
  subtitle: string;
  /** Primary solid action buttons. */
  solidBtn: string;
  /** Small square logo / icon box. */
  logoBox: string;
  /** Active sidebar nav item background + text. */
  navActive: string;
  navIcon: string;
  /** "Live" status pill in the header. */
  livePill: string;
  liveDot: string;
  /** Fallback avatar chip. */
  avatarFallback: string;
  /** Soft chip used by the board switcher. */
  switcherChip: string;
  /** Accent focus ring for inputs. */
  focusInput: string;
}

export const BOARD_ACCENTS: Record<BoardType, BoardAccent> = {
  kitchen: {
    label: 'Kitchen',
    subtitle: 'Real-time Kitchen Board',
    solidBtn: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white',
    logoBox: 'bg-emerald-600 text-white',
    navActive: 'bg-emerald-50 text-emerald-700',
    navIcon: 'text-emerald-600',
    livePill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    liveDot: 'bg-emerald-500',
    avatarFallback: 'bg-emerald-100 text-emerald-800',
    switcherChip: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    focusInput: 'focus:ring-emerald-500/20 focus:border-emerald-500'
  },
  delivery: {
    label: 'Delivery',
    subtitle: 'Live Delivery Dispatch',
    solidBtn: 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white',
    logoBox: 'bg-indigo-600 text-white',
    navActive: 'bg-indigo-50 text-indigo-700',
    navIcon: 'text-indigo-600',
    livePill: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    liveDot: 'bg-indigo-500',
    avatarFallback: 'bg-indigo-100 text-indigo-800',
    switcherChip: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
    focusInput: 'focus:ring-indigo-500/20 focus:border-indigo-500'
  }
};
