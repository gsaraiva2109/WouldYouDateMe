import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useConfig } from "./hooks/useConfig";
import { submitAnswer } from "./lib/api";
import { screenVariants } from "./animations/variants";
import type { Activity, SelectedSlot, Venue } from "./types";

import { Stage } from "./components/Stage";
import { ProgressDots } from "./components/ProgressDots";
import { Teaser } from "./steps/Teaser";
import { Ask } from "./steps/Ask";
import { Activity as ActivityStep } from "./steps/Activity";
import { Schedule } from "./steps/Schedule";
import { Place } from "./steps/Place";
import { Message } from "./steps/Message";
import { Celebration } from "./steps/Celebration";

type Step =
  | "teaser"
  | "ask"
  | "activity"
  | "schedule"
  | "place"
  | "message"
  | "celebration";

const ORDER: Step[] = [
  "teaser",
  "ask",
  "activity",
  "schedule",
  "place",
  "message",
  "celebration",
];

export default function App() {
  const cfg = useConfig();

  const [step, setStep] = useState<Step>("teaser");
  const [activity, setActivity] = useState<Activity | null>(null);
  const [slot, setSlot] = useState<SelectedSlot | null>(null);
  const [place, setPlace] = useState<Venue | null>(null);
  const [suggestion, setSuggestion] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (cfg.status === "loading") {
    return (
      <>
        <Stage />
        <div className="screen">
          <div className="hand">carregando…</div>
        </div>
      </>
    );
  }

  if (cfg.status === "error") {
    return (
      <>
        <Stage />
        <div className="screen">
          <div className="inner">
            <h2 className="headline">Ops.</h2>
            <p className="sub">Não consegui carregar a config. ({cfg.error})</p>
          </div>
        </div>
      </>
    );
  }

  const config = cfg.config;

  function go(next: Step) {
    setError(null);
    setStep(next);
  }

  async function handleSubmit(text: string) {
    setSubmitting(true);
    setError(null);
    const finalMessage = text || null;
    setMessage(finalMessage);
    const placeSuggestion = suggestion.trim() || null;
    try {
      await submitAnswer({
        answeredYes: true,
        activity,
        slot,
        place,
        placeSuggestion,
        message: finalMessage,
      });
      setStep("celebration");
    } catch {
      setError(config.copy.errors.submit);
    } finally {
      setSubmitting(false);
    }
  }

  // Progress dots cover the interactive steps (after teaser, before celebration).
  const dotTotal = ORDER.length - 2;
  const dotCurrent = ORDER.indexOf(step) - 1;
  const showDots = step !== "teaser" && step !== "celebration";

  return (
    <>
      <Stage />
      {showDots && <ProgressDots total={dotTotal} current={dotCurrent} />}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="screen"
          variants={screenVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {step === "teaser" && <Teaser config={config} onNext={() => go("ask")} />}
          {step === "ask" && <Ask config={config} onYes={() => go("activity")} />}
          {step === "activity" && (
            <ActivityStep
              config={config}
              selected={activity}
              onSelect={(a) => {
                setActivity(a);
                // changing activity invalidates a prior time + place choice
                setSlot(null);
                setPlace(null);
                setTimeout(() => go("schedule"), 280);
              }}
            />
          )}
          {step === "schedule" && (
            <Schedule
              config={config}
              activity={activity}
              selected={slot}
              onSelect={setSlot}
              onNext={() => go("place")}
              onBack={() => go("activity")}
            />
          )}
          {step === "place" && (
            <Place
              config={config}
              activity={activity}
              slot={slot}
              selected={place}
              suggestion={suggestion}
              onSelect={setPlace}
              onSuggest={setSuggestion}
              onNext={() => go("message")}
              onBack={() => go("schedule")}
            />
          )}
          {step === "message" && (
            <Message
              config={config}
              submitting={submitting}
              error={error}
              onSubmit={handleSubmit}
              onBack={() => go("place")}
            />
          )}
          {step === "celebration" && (
            <Celebration
              config={config}
              activity={activity}
              slot={slot}
              place={place}
              suggestion={suggestion.trim() || null}
              message={message}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
