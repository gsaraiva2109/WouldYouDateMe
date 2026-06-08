import { useEffect, useState } from "react";
import type { SiteConfig } from "../types";

type State =
  | { status: "loading" }
  | { status: "ready"; config: SiteConfig }
  | { status: "error"; error: string };

export function useConfig(): State {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let alive = true;

    async function load(path: string): Promise<SiteConfig> {
      const r = await fetch(path, { cache: "no-cache" });
      if (!r.ok) throw new Error(`config ${r.status}`);
      return r.json();
    }

    // Real config is mounted at runtime; fall back to the committed example
    // so the site never breaks if the mount is missing.
    load("/config.json")
      .catch(() => load("/config.example.json"))
      .then((config) => {
        if (alive) setState({ status: "ready", config });
      })
      .catch((err) => {
        if (alive) setState({ status: "error", error: String(err) });
      });

    return () => {
      alive = false;
    };
  }, []);

  return state;
}
