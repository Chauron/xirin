import { create } from 'zustand';
import type { Spot, Catch } from '../models/types';
import { db } from '../db/db';

interface AppState {
  spots: Spot[];
  catches: Catch[];
  loading: boolean;
  loadSpots: () => Promise<void>;
  addSpot: (spot: Spot) => Promise<number>;
  updateSpot: (id: number, spot: Partial<Spot>) => Promise<void>;
  deleteSpot: (id: number) => Promise<void>;
  loadCatches: () => Promise<void>;
  addCatch: (newCatch: Catch) => Promise<number>;
  updateCatch: (id: number, catchData: Partial<Catch>) => Promise<void>;
  deleteCatch: (id: number) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  spots: [],
  catches: [],
  loading: false,

  loadSpots: async () => {
    set({ loading: true });
    try {
      const spots = await db.spots.toArray();
      set({ spots });
    } finally {
      set({ loading: false });
    }
  },

  addSpot: async (spot: Spot) => {
    const id = await db.spots.add(spot);
    await get().loadSpots();
    return id as number;
  },

  updateSpot: async (id: number, spot: Partial<Spot>) => {
    await db.spots.update(id, spot);
    await get().loadSpots();
  },

  deleteSpot: async (id: number) => {
    await db.spots.delete(id);
    // Also delete associated catches? Maybe optional.
    await get().loadSpots();
  },

  loadCatches: async () => {
    set({ loading: true });
    try {
      const catches = await db.catches.toArray();
      set({ catches });
    } finally {
      set({ loading: false });
    }
  },

  addCatch: async (newCatch: Catch) => {
    const id = await db.catches.add(newCatch);
    await get().loadCatches();
    return id as number;
  },

  updateCatch: async (id: number, catchData: Partial<Catch>) => {
    await db.catches.update(id, catchData);
    await get().loadCatches();
  },

  deleteCatch: async (id: number) => {
    await db.catches.delete(id);
    await get().loadCatches();
  }
}));
