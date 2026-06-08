import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import { existsSync } from "node:fs";
import { saveAnswer } from "./store.ts";
import { pushNtfy } from "./ntfy.ts";

const app = new Hono();
const PORT = Number(process.env.PORT ?? 3000);
const STATIC_DIR = process.env.STATIC_DIR ?? "./public";
const DATA_DIR = process.env.DATA_DIR ?? "./data";

// CORS only matters in dev when Vite (5173) talks to the API (3000).
app.use("/api/*", cors());

// Personal content override: if a config.json exists in the (persistent) data
// volume, serve that instead of the baked-in one. Lets you drop the real config
// next to the database without rebuilding. Served no-store so edges/browsers
// never cache a stale copy. Falls through to the static file otherwise.
app.get("/config.json", async (c) => {
  const override = `${DATA_DIR}/config.json`;
  if (existsSync(override)) {
    try {
      const text = await Bun.file(override).text();
      return new Response(text, {
        headers: { "content-type": "application/json", "cache-control": "no-store" },
      });
    } catch {
      // fall through to static below
    }
  }
  return c.notFound(); // static handler (registered later) serves the baked file
});

app.get("/api/health", (c) => c.json({ ok: true, ts: new Date().toISOString() }));

interface AnswerBody {
  answeredYes?: boolean;
  activity?: { id?: string; label?: string } | string | null;
  slot?: { day?: string; time?: string } | null;
  place?: { name?: string; area?: string } | null;
  placeSuggestion?: string | null;
  message?: string | null;
}

app.post("/api/answer", async (c) => {
  let body: AnswerBody;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: "invalid JSON" }, 400);
  }

  const activityLabel =
    typeof body.activity === "string"
      ? body.activity
      : (body.activity?.label ?? body.activity?.id ?? null);
  const day = body.slot?.day ?? null;
  const time = body.slot?.time ?? null;
  const place = body.place?.name ?? null;
  const placeArea = body.place?.area ?? null;
  const placeSuggestion =
    (body.placeSuggestion ?? "").toString().slice(0, 200).trim() || null;
  const message = (body.message ?? "").toString().slice(0, 1000).trim() || null;
  const answeredYes = body.answeredYes !== false; // default true

  const createdAt = new Date().toISOString();
  const ip =
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    c.req.header("x-real-ip") ??
    null;
  const userAgent = c.req.header("user-agent") ?? null;

  const id = saveAnswer({
    answeredYes,
    activity: activityLabel,
    day,
    time,
    place,
    placeArea,
    placeSuggestion,
    message,
    createdAt,
    ip,
    userAgent,
  });

  // Fire the iPhone push. Non-blocking failure: she still gets her celebration.
  const when = day && time ? `${day} às ${time}` : day || time || "a combinar";
  const localTime = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(createdAt));

  const placeLine = place
    ? `${place}${placeArea ? ` (${placeArea})` : ""}`
    : placeSuggestion
      ? `${placeSuggestion} (sugestão dela)`
      : "—";

  const lines = [
    `Resposta: ${answeredYes ? "SIM! 🎉" : "não 😢"}`,
    `Programa: ${activityLabel ?? "—"}`,
    `Quando: ${when}`,
    `Onde: ${placeLine}`,
    message ? `Recado: "${message}"` : null,
    `Em: ${localTime}`,
  ].filter(Boolean);

  await pushNtfy({
    title: `${process.env.NOTIFY_NAME ?? "Ela"} respondeu!`,
    message: lines.join("\n"),
    tags: answeredYes ? ["tada", "heart"] : ["broken_heart"],
    priority: 5,
  });

  return c.json({ ok: true, id });
});

// Serve the built frontend (single-container deploy). API routes win above.
app.use("/*", serveStatic({ root: STATIC_DIR }));
// SPA fallback so deep links / refreshes resolve to index.html.
app.get("/*", serveStatic({ path: `${STATIC_DIR}/index.html` }));

console.log(`✦ backend on :${PORT} (static: ${STATIC_DIR})`);

export default {
  port: PORT,
  fetch: app.fetch,
};
