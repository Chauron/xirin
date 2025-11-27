import Dexie, { type Table } from 'dexie';
import type { Spot, Catch } from '../models/types';

export class XirinDatabase extends Dexie {
  spots!: Table<Spot>;
  catches!: Table<Catch>;

  constructor() {
    super('XirinDB');
    this.version(1).stores({
      spots: '++id, name, type, createdAt',
      catches: '++id, spotId, date, species'
    });
  }
}

export const db = new XirinDatabase();
