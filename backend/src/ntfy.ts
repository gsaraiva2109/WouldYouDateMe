interface NtfyPayload {
  title: string;
  message: string;
  tags?: string[];
  priority?: number;
}

const NTFY_URL = process.env.NTFY_URL; // e.g. https://ntfy.example.com
const NTFY_TOPIC = process.env.NTFY_TOPIC; // e.g. my-topic
const NTFY_TOKEN = process.env.NTFY_TOKEN; // optional bearer token

/**
 * Push a notification to a self-hosted ntfy topic.
 * No-op (with a warning) when NTFY_URL/NTFY_TOPIC are unset, so local dev
 * never fails just because notifications aren't configured.
 */
export async function pushNtfy(payload: NtfyPayload): Promise<void> {
  if (!NTFY_URL || !NTFY_TOPIC) {
    console.warn("ntfy not configured (NTFY_URL/NTFY_TOPIC missing) — skipping push.");
    return;
  }

  const url = `${NTFY_URL.replace(/\/$/, "")}/${NTFY_TOPIC}`;
  const headers: Record<string, string> = {
    Title: encodeHeader(payload.title),
  };
  if (payload.tags?.length) headers["Tags"] = payload.tags.join(",");
  if (payload.priority) headers["Priority"] = String(payload.priority);
  if (NTFY_TOKEN) headers["Authorization"] = `Bearer ${NTFY_TOKEN}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: payload.message,
    });
    if (!res.ok) {
      console.error(`ntfy push failed: ${res.status} ${await res.text()}`);
    }
  } catch (err) {
    console.error("ntfy push error:", err);
  }
}

// ntfy headers must be ASCII; emoji/accents go via RFC 2047-ish encoding.
// ntfy supports UTF-8 in the body freely, but headers need escaping.
function encodeHeader(value: string): string {
  // eslint-disable-next-line no-control-regex
  if (/^[\x00-\x7F]*$/.test(value)) return value;
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\x00-\x7F]/g, "");
}
