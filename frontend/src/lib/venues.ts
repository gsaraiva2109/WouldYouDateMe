import type { Activity, SelectedSlot, SiteConfig, TimeBucket, Venue } from "../types";
import { bucketFromTime } from "./time";

function realOnly(list: Venue[] | undefined): Venue[] {
  return (list ?? []).filter((v) => v.name && !v.name.startsWith("<"));
}

/**
 * Resolve venue options for the chosen activity + time-of-day.
 * Falls back to all venues for the activity when the exact bucket is empty.
 */
export function resolveVenues(
  config: SiteConfig,
  activity: Activity | null,
  slot: SelectedSlot | null,
): { bucket: TimeBucket | null; venues: Venue[] } {
  const bucket = slot ? bucketFromTime(slot.time) : null;
  const byActivity = activity ? config.venues[activity.id] : undefined;
  let venues = bucket ? realOnly(byActivity?.[bucket]) : [];
  if (venues.length === 0 && byActivity) {
    venues = realOnly(Object.values(byActivity).flat());
  }
  return { bucket, venues };
}
