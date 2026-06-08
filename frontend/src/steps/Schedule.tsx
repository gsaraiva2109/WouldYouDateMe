import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Activity, SelectedSlot, SiteConfig } from "../types";
import { rise, stagger } from "../animations/variants";
import { bucketFromTime } from "../lib/time";
import { BackLink } from "../components/BackLink";

export function Schedule({
  config,
  activity,
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  config: SiteConfig;
  activity: Activity | null;
  selected: SelectedSlot | null;
  onSelect: (s: SelectedSlot) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const c = config.copy.schedule;
  const allowed = activity?.buckets;

  // Only offer times that fit the chosen activity (jantar never at noon, etc).
  const days = config.slots
    .map((slot) => ({
      day: slot.day,
      times: slot.times.filter((t) => !allowed || allowed.includes(bucketFromTime(t))),
    }))
    .filter((d) => d.times.length > 0);

  // Show one day at a time to keep the screen compact.
  const [openDay, setOpenDay] = useState<string | null>(
    selected?.day ?? days[0]?.day ?? null,
  );

  // Keep the open day valid when the activity (and thus available days) changes.
  useEffect(() => {
    if (!days.some((d) => d.day === openDay)) {
      setOpenDay(days[0]?.day ?? null);
    }
  }, [days, openDay]);

  const times = days.find((d) => d.day === openDay)?.times ?? [];

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

      {days.length === 0 ? (
        <motion.p className="hand" variants={rise}>
          Sem horário pra esse rolê aqui — volta e escolhe outro programa 😅
        </motion.p>
      ) : (
        <>
          {/* Day selector — one compact row */}
          <motion.div className="day-row" variants={rise}>
            {days.map((d) => (
              <motion.button
                key={d.day}
                className={`chip${openDay === d.day ? " selected" : ""}`}
                whileTap={{ scale: 0.92 }}
                onClick={() => setOpenDay(d.day)}
              >
                {d.day}
              </motion.button>
            ))}
          </motion.div>

          {/* Times for the open day */}
          <motion.div className="time-wrap" variants={rise}>
            <AnimatePresence mode="wait">
              <motion.div
                key={openDay ?? "none"}
                className="chips"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {times.map((time) => {
                  const isSel = selected?.day === openDay && selected?.time === time;
                  return (
                    <motion.button
                      key={time}
                      className={`chip${isSel ? " selected" : ""}`}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => openDay && onSelect({ day: openDay, time })}
                    >
                      {time}
                    </motion.button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </>
      )}

      <motion.button
        className="btn"
        variants={rise}
        disabled={!selected}
        whileTap={{ scale: selected ? 0.96 : 1 }}
        onClick={() => selected && onNext()}
        style={{ marginTop: 8 }}
      >
        {selected ? `Continuar · ${selected.day} ${selected.time}` : "Escolhe um horário"}
      </motion.button>

      <BackLink onClick={onBack} />
    </motion.div>
  );
}
