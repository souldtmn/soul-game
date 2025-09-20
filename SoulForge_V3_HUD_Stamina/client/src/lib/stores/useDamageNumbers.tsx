
import { create } from "zustand";

export type DamageKind = 'normal' | 'crit' | 'blocked' | 'dodged' | 'heal';

export interface DamageNumber {
  id: string;
  value: number;
  text?: string;
  kind: DamageKind;
  x: number;
  y: number;
  z: number;
  createdAt: number;
  ttl: number;
}

interface DamageNumbersState {
  items: DamageNumber[];
  addNumber: (n: Omit<DamageNumber, 'id' | 'createdAt'>) => void;
  purge: () => void;
}

export const useDamageNumbers = create<DamageNumbersState>((set, get) => ({
  items: [],
  addNumber: (n) => {
    const id = Math.random().toString(36).slice(2);
    const createdAt = Date.now();
    set({ items: [...get().items, { ...n, id, createdAt }] });
  },
  purge: () => {
    const now = Date.now();
    set({ items: get().items.filter(i => now - i.createdAt < i.ttl) });
  }
}));
