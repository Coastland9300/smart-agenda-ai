import { CalendarEvent } from '../types';

// Helper to generate a random Series ID
const generateSeriesId = () => Math.random().toString(36).substr(2, 9);

interface GenerationOptions {
  count?: number; // Generate specifically N instances
  untilDate?: Date; // Generate until a specific date
}

/**
 * Generates recurring instances for an event.
 * Automatically assigns a seriesId if one is not present.
 */
export const generateRecurringInstances = (
  baseEvent: Omit<CalendarEvent, 'id'>,
  options: GenerationOptions
): Omit<CalendarEvent, 'id'>[] => {
  if (!baseEvent.recurrence || baseEvent.recurrence === 'none') {
    return [baseEvent];
  }

  const instances: Omit<CalendarEvent, 'id'>[] = [];
  const baseDate = new Date(baseEvent.start_time);
  const baseEndDate = baseEvent.end_time ? new Date(baseEvent.end_time) : null;
  const durationMs = baseEndDate ? baseEndDate.getTime() - baseDate.getTime() : 3600000; // default 1h

  // Ensure we have a series ID to link these events
  const seriesId = baseEvent.seriesId || generateSeriesId();
  const interval = baseEvent.recurrenceInterval || 1;

  // Determine limits
  // Default to 1 if no options provided, though logic below handles loop
  let limitCount = options.count;
  const limitDate = options.untilDate;

  // Safety break to prevent infinite loops if something goes wrong
  const SAFETY_MAX = 365;

  let i = 0;
  while (true) {
    // Check stop conditions
    if (limitCount !== undefined && i >= limitCount) break;

    // Calculate new times
    const newStart = new Date(baseDate);
    const newEnd = new Date(newStart.getTime() + durationMs);

    // Apply recurrence logic with interval
    if (baseEvent.recurrence === 'daily') {
      newStart.setDate(baseDate.getDate() + (i * interval));
      newEnd.setDate(newEnd.getDate() + (i * interval));
    } else if (baseEvent.recurrence === 'weekly') {
      newStart.setDate(baseDate.getDate() + (i * 7 * interval));
      newEnd.setDate(newEnd.getDate() + (i * 7 * interval));
    } else if (baseEvent.recurrence === 'monthly') {
      newStart.setMonth(baseDate.getMonth() + (i * interval));
      newEnd.setMonth(newEnd.getMonth() + (i * interval));
    } else if (baseEvent.recurrence === 'yearly') {
      newStart.setFullYear(baseDate.getFullYear() + (i * interval));
      newEnd.setFullYear(newEnd.getFullYear() + (i * interval));
    }

    // Check date limit if provided
    if (limitDate && newStart > limitDate) break;

    instances.push({
      ...baseEvent,
      seriesId,
      recurrenceInterval: interval, // Ensure interval is persisted
      start_time: newStart.toISOString(),
      end_time: newEnd.toISOString(),
      color: baseEvent.color // Persist color
    });

    i++;
    if (i >= SAFETY_MAX) break;
  }

  return instances;
};

/**
 * Checks all events and extends any routines that are ending soon (Rolling Horizon).
 * Returns ONLY the new events that need to be added.
 */
export const checkAndExtendRoutine = (events: CalendarEvent[]): Omit<CalendarEvent, 'id'>[] => {
  // const now = new Date();
  const HORIZON_DAYS = 90; // Keep schedule filled for 3 months ahead
  const horizonDate = new Date();
  horizonDate.setDate(horizonDate.getDate() + HORIZON_DAYS);

  // Group events by seriesId
  const groups: Record<string, CalendarEvent[]> = {};

  events.forEach(e => {
    // Only process events that have a seriesId and are recurring
    if (e.seriesId && e.recurrence && e.recurrence !== 'none') {
      if (!groups[e.seriesId]) groups[e.seriesId] = [];
      groups[e.seriesId].push(e);
    }
  });

  const newEventsToAdd: Omit<CalendarEvent, 'id'>[] = [];

  Object.values(groups).forEach(groupEvents => {
    // Find the very last event in this series
    const lastEvent = groupEvents.reduce((latest, current) =>
      new Date(current.start_time) > new Date(latest.start_time) ? current : latest
    );

    const lastDate = new Date(lastEvent.start_time);

    // If the last event is before our horizon, we need to extend
    if (lastDate < horizonDate) {

      // Start generating from the NEXT occurrence after the last one
      const nextBaseEvent = { ...lastEvent };
      const nextStartDate = new Date(lastEvent.start_time);
      const interval = lastEvent.recurrenceInterval || 1;

      // Logic to step forward once
      if (lastEvent.recurrence === 'daily') {
        nextStartDate.setDate(nextStartDate.getDate() + interval);
      } else if (lastEvent.recurrence === 'weekly') {
        nextStartDate.setDate(nextStartDate.getDate() + (7 * interval));
      } else if (lastEvent.recurrence === 'monthly') {
        nextStartDate.setMonth(nextStartDate.getMonth() + interval);
      } else if (lastEvent.recurrence === 'yearly') {
        nextStartDate.setFullYear(nextStartDate.getFullYear() + interval);
      }

      // Adjust end time
      const originalDuration = (new Date(lastEvent.end_time || '').getTime() || 0) - new Date(lastEvent.start_time).getTime();
      const validDuration = originalDuration > 0 ? originalDuration : 3600000;

      nextBaseEvent.start_time = nextStartDate.toISOString();
      nextBaseEvent.end_time = new Date(nextStartDate.getTime() + validDuration).toISOString();

      const { id, ...cleanBase } = nextBaseEvent;

      const extensions = generateRecurringInstances(cleanBase, {
        untilDate: horizonDate
      });

      newEventsToAdd.push(...extensions);
    }
  });

  return newEventsToAdd;
};