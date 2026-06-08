export interface Venue {
  name: string;
  area: string;
  note?: string;
}

export type TimeBucket = "manha" | "almoco" | "tarde" | "noite";

export type VenueMap = Record<string, Partial<Record<TimeBucket, Venue[]>>>;

export interface Activity {
  id: string;
  label: string;
  emoji: string;
  blurb?: string;
  /** Which time-of-day buckets this activity is valid for. Omit = any. */
  buckets?: TimeBucket[];
}

export interface Slot {
  day: string;
  times: string[];
}

export interface SiteConfig {
  girlName: string;
  theme: { songTitle: string; songArtist: string };
  copy: {
    teaser: { eyebrow: string; headline: string; sub: string; cta: string };
    ask: { headline: string; sub: string; yes: string; noLabels: string[] };
    activity: { headline: string; sub: string };
    schedule: { headline: string; sub: string };
    place: {
      headline: string;
      sub: string;
      suggestLabel: string;
      suggestPlaceholder: string;
      empty: string;
      next: string;
    };
    message: {
      headline: string;
      sub: string;
      placeholder: string;
      submit: string;
    };
    celebration: { headline: string; sub: string; recapTitle: string };
    errors: { submit: string };
  };
  activities: Activity[];
  slots: Slot[];
  venues: VenueMap;
}

export interface SelectedSlot {
  day: string;
  time: string;
}

export interface AnswerPayload {
  answeredYes: boolean;
  activity: Activity | null;
  slot: SelectedSlot | null;
  place: Venue | null;
  placeSuggestion: string | null;
  message: string | null;
}
