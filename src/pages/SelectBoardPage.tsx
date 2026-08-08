import React from 'react';
import { motion } from 'motion/react';
import { ChefHat, Bike, ArrowRight, Sparkles } from 'lucide-react';
import { BoardType, User } from '../types';

interface SelectBoardPageProps {
  currentUser: User | null;
  onSelect: (board: BoardType) => void;
}

interface BoardCard {
  type: BoardType;
  title: string;
  description: string;
  icon: React.ElementType;
  accentText: string;
  accentSoft: string;
  accentIconBox: string;
  hoverBorder: string;
  hoverGlow: string;
  gradient: string;
}

const CARDS: BoardCard[] = [
  {
    type: 'kitchen',
    title: 'Kitchen',
    description:
      'Live orders from floor to pass. Waiters send orders, chefs cook and advance them through New → Cooking → Ready → Served.',
    icon: ChefHat,
    accentText: 'text-emerald-700',
    accentSoft: 'text-emerald-600',
    accentIconBox: 'bg-emerald-600 text-white',
    hoverBorder: 'hover:border-emerald-400',
    hoverGlow: 'hover:shadow-emerald-200/60',
    gradient: 'from-emerald-50 to-white'
  },
  {
    type: 'delivery',
    title: 'Delivery',
    description:
      'Track delivery orders from kitchen to doorstep. Dispatch, assign riders, and follow each drop live from Preparing to Delivered.',
    icon: Bike,
    accentText: 'text-indigo-700',
    accentSoft: 'text-indigo-600',
    accentIconBox: 'bg-indigo-600 text-white',
    hoverBorder: 'hover:border-indigo-400',
    hoverGlow: 'hover:shadow-indigo-200/60',
    gradient: 'from-indigo-50 to-white'
  }
];

export const SelectBoardPage: React.FC<SelectBoardPageProps> = ({ currentUser, onSelect }) => {
  const firstName = currentUser?.name?.split(' ')[0];

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col items-center justify-center p-6 antialiased">
      <div className="w-full max-w-4xl">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-500 shadow-xs mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            KitchenSync Workspaces
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            {firstName ? `Welcome back, ${firstName}.` : 'Choose your board'}
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Pick a board to open. You can switch anytime from the header.
          </p>
        </motion.div>

        {/* Board cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.type}
                type="button"
                onClick={() => onSelect(card.type)}
                aria-label={`Open ${card.title} board`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.05 + i * 0.08 }}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.98 }}
                className={`group text-left relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-b ${card.gradient} p-6 shadow-sm hover:shadow-xl ${card.hoverGlow} ${card.hoverBorder} transition-[box-shadow,border-color] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-14 h-14 rounded-2xl ${card.accentIconBox} flex items-center justify-center shadow-md`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className={`opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all ${card.accentSoft}`}>
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </div>

                <h2 className={`text-xl font-black tracking-tight ${card.accentText} mb-1.5`}>
                  {card.title}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed font-medium min-h-[60px]">
                  {card.description}
                </p>

                <div className="mt-5 pt-4 border-t border-slate-200/70 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Board
                  </span>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${card.accentSoft}`}>
                    Tap to open
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SelectBoardPage;
