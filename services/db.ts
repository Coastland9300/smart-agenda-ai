import Dexie, { type EntityTable } from 'dexie';
import { CalendarEvent } from '../types';

// Dexie 4.x pattern
const dbInstance = new Dexie('SmartAgendaDB') as Dexie & {
  events: EntityTable<CalendarEvent, 'id'>;
};

dbInstance.version(1).stores({
  events: '++id, seriesId, start_time, recurrence'
});

export const db = {
  async getEvents(): Promise<CalendarEvent[]> {
    return await dbInstance.events.toArray();
  },

  async addEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const id = await dbInstance.events.add(event as CalendarEvent);
    return { ...event, id };
  },

  async addEvents(eventsData: Omit<CalendarEvent, 'id'>[]): Promise<CalendarEvent[]> {
    const ids = await dbInstance.events.bulkAdd(eventsData as CalendarEvent[], { allKeys: true });

    // Return objects with their new IDs
    return eventsData.map((evt, index) => ({
      ...evt,
      id: ids[index] as number
    }));
  },

  async deleteEvent(id: string | number): Promise<void> {
    const numId = Number(id);
    await dbInstance.events.delete(numId);
  },

  async updateEvent(id: string | number, updates: Partial<CalendarEvent>): Promise<void> {
    const numId = Number(id);
    await dbInstance.events.update(numId, updates);
  },

  async exportEvents(): Promise<string> {
    const events = await dbInstance.events.toArray();
    return JSON.stringify(events, null, 2);
  },

  async importEvents(jsonData: string): Promise<number> {
    try {
      const events = JSON.parse(jsonData) as CalendarEvent[];
      if (!Array.isArray(events)) throw new Error("Invalid format");

      const eventsToImport = events.map(e => {
        const { id, ...rest } = e;
        return rest;
      });

      await dbInstance.events.bulkAdd(eventsToImport as CalendarEvent[]);
      return eventsToImport.length;
    } catch (e) {
      console.error("Import failed", e);
      throw e;
    }
  },

  async clearEvents(): Promise<void> {
    await dbInstance.events.clear();
  }
};