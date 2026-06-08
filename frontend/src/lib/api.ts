import type { AnswerPayload } from "../types";

export async function submitAnswer(
  payload: AnswerPayload,
): Promise<{ ok: boolean; id?: number }> {
  const res = await fetch("/api/answer", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`submit failed: ${res.status}`);
  return res.json();
}
