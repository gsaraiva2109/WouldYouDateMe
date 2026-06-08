import { useState } from "react";
import { motion } from "framer-motion";
import type { Activity, SelectedSlot, SiteConfig, Venue } from "../types";
import { rise, stagger } from "../animations/variants";
import { resolveVenues } from "../lib/venues";
import { BUCKET_LABEL } from "../lib/time";
import { BackLink } from "../components/BackLink";

export function Place({
  config,
  activity,
  slot,
  selected,
  suggestion,
  onSelect,
  onSuggest,
  onNext,
  onBack,
}: {
  config: SiteConfig;
  activity: Activity | null;
  slot: SelectedSlot | null;
  selected: Venue | null;
  suggestion: string;
  onSelect: (v: Venue | null) => void;
  onSuggest: (s: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const c = config.copy.place;
  const { bucket, venues } = resolveVenues(config, activity, slot);
  const [showSuggest, setShowSuggest] = useState(suggestion.length > 0);

  const canContinue = Boolean(selected) || suggestion.trim().length > 0;

  return (
    <motion.div
      className="inner scroller"
      variants={stagger}
      initial="enter"
      animate="center"
    >
      <motion.h2 className="headline" variants={rise}>
        {c.headline}
      </motion.h2>
      <motion.p className="sub" variants={rise}>
        {c.sub}
      </motion.p>

      {bucket && (
        <motion.div className="hand" variants={rise}>
          {activity?.emoji} {activity?.label} {BUCKET_LABEL[bucket]}
        </motion.div>
      )}

      <motion.div className="venue-list" variants={rise}>
        {venues.map((v) => {
          const isSel = selected?.name === v.name;
          return (
            <motion.button
              key={v.name}
              className={`venue-card${isSel ? " selected" : ""}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onSelect(isSel ? null : v);
                if (!isSel) {
                  onSuggest("");
                  setShowSuggest(false);
                }
              }}
            >
              <div className="venue-card-head">
                <span className="vn">{v.name}</span>
                <span className="va">{v.area}</span>
              </div>
              {v.note && <span className="vnote">{v.note}</span>}
              <span className={`pick-dot${isSel ? " on" : ""}`} aria-hidden="true" />
            </motion.button>
          );
        })}
      </motion.div>

      {/* Suggest-your-own */}
      {!showSuggest ? (
        <motion.button
          className="btn-ghost suggest-toggle"
          variants={rise}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            setShowSuggest(true);
            onSelect(null);
          }}
        >
          ✎ {c.suggestLabel}
        </motion.button>
      ) : (
        <motion.div
          className="suggest-box"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <label className="hand" style={{ alignSelf: "flex-start" }}>
            {c.suggestLabel}
          </label>
          <input
            className="note"
            style={{ minHeight: 0, height: 54 }}
            placeholder={c.suggestPlaceholder}
            maxLength={120}
            value={suggestion}
            autoFocus
            onChange={(e) => {
              onSuggest(e.target.value);
              if (e.target.value) onSelect(null);
            }}
          />
        </motion.div>
      )}

      <motion.button
        className="btn"
        variants={rise}
        disabled={!canContinue}
        whileTap={{ scale: canContinue ? 0.96 : 1 }}
        onClick={() => canContinue && onNext()}
        style={{ marginTop: 8 }}
      >
        {c.next}
      </motion.button>

      <BackLink onClick={onBack} />
    </motion.div>
  );
}
