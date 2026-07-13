type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

const GRACE_SYSTEM = `You are Grace, a gentle Bible companion app. Voice: warm, unhurried, never preachy or guilt-inducing. Use short paragraphs. Reference scripture faithfully. No emojis.`;

export async function completeChat(messages: ChatMessage[]): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const base = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');

  if (!key) {
    const last = messages.filter((m) => m.role === 'user').pop()?.content ?? '';
    return `[Grace — configure OPENAI_API_KEY for live responses]\n\n${fallbackReply(last)}`;
  }

  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1800,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LLM error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('LLM returned empty response');
  return text;
}

function fallbackReply(userText: string): string {
  return `Thank you for sharing that with me. I'm here with you in this — take a breath, and we'll walk through it gently together.\n\n(Your note: "${userText.slice(0, 120)}")`;
}

export type UserContext = {
  name?: string | null;
  carrying?: string[];
  gentleness?: string | null;
  rhythm?: string | null;
};

function contextLine(ctx: UserContext) {
  const parts = [];
  if (ctx.name) parts.push(`name: ${ctx.name}`);
  if (ctx.carrying?.length) parts.push(`carrying: ${ctx.carrying.join(', ')}`);
  if (ctx.gentleness) parts.push(`gentleness: ${ctx.gentleness}`);
  if (ctx.rhythm) parts.push(`rhythm: ${ctx.rhythm}`);
  return parts.length ? `User context — ${parts.join('; ')}.` : '';
}

export async function generateStoryNarrative(
  story: { title: string; subtitle: string; hook: string; scriptureRange: string; parts: number },
  ctx: UserContext,
  part = 1,
) {
  const user = `${contextLine(ctx)}

Write part ${part} of ${story.parts} of an audio Bible story narration for "${story.title}" (${story.subtitle}).
Scripture: ${story.scriptureRange}. Hook: "${story.hook}".
~400-600 words. Second person where natural. End with a quiet landing, not a cliffhanger sermon.`;

  return completeChat([
    { role: 'system', content: GRACE_SYSTEM },
    { role: 'user', content: user },
  ]);
}

export async function generateReminderMessage(
  pref: { type: string; morningTime?: string; eveningTime?: string },
  ctx: UserContext,
) {
  const slot =
    pref.type === 'evening'
      ? `evening at ${pref.eveningTime ?? '21:00'}`
      : pref.type === 'both'
        ? `morning ${pref.morningTime ?? '07:00'} and evening ${pref.eveningTime ?? '21:00'}`
        : `morning at ${pref.morningTime ?? '07:00'}`;

  const user = `${contextLine(ctx)}

Write a single push-notification body (max 120 chars) for a ${slot} Bible companion reminder. Gentle, invitational, no guilt. Also write a longer companion line (2 sentences, max 200 chars) for in-app preview. Format exactly:
NOTIFICATION: <text>
PREVIEW: <text>`;

  const raw = await completeChat([
    { role: 'system', content: GRACE_SYSTEM },
    { role: 'user', content: user },
  ]);

  const notif = raw.match(/NOTIFICATION:\s*(.+)/i)?.[1]?.trim() ?? 'Your quiet place is ready.';
  const preview = raw.match(/PREVIEW:\s*(.+)/i)?.[1]?.trim() ?? notif;
  return { notification: notif.slice(0, 160), preview: preview.slice(0, 280), raw };
}

export async function generateSupportReply(
  category: string,
  message: string,
  ctx: UserContext,
  email?: string | null,
) {
  const user = `${contextLine(ctx)}
${email ? `Reply email: ${email}.` : ''}
Category: ${category}
User message: ${message}

Write a helpful Grace-voiced reply (3-5 short paragraphs). Acknowledge their concern, offer practical next steps for this app category, and close warmly. If billing/subscription, mention beta trial and Settings.`;

  const reply = await completeChat([
    { role: 'system', content: GRACE_SYSTEM },
    { role: 'user', content: user },
  ]);

  return reply;
}
