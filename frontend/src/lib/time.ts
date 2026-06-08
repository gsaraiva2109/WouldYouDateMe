import type { TimeBucket } from "../types";

/**
 * Derive the meal/part-of-day bucket from an "HH:MM" string.
 *   08:00–11:59 → manhã (café da manhã)
 *   12:00–13:59 → almoço
 *   14:00–17:59 → tarde (café / brunch / lanche)
 *   18:00+      → noite (jantar / drinks)
 */
export function bucketFromTime(time: string): TimeBucket {
  const hour = Number(time.split(":")[0] ?? 0);
  if (hour < 12) return "manha";
  if (hour < 14) return "almoco";
  if (hour < 18) return "tarde";
  return "noite";
}

export const BUCKET_LABEL: Record<TimeBucket, string> = {
  manha: "de manhã",
  almoco: "no almoço",
  tarde: "à tarde",
  noite: "à noite",
};
