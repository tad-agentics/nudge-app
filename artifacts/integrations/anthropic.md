# Integration: Anthropic (Claude API)

**Last researched:** 2026-03-29  
**SDK / package:** `@anthropic-ai/sdk` (recommended) or `fetch` to `https://api.anthropic.com/v1/messages`  
**Docs:** https://docs.anthropic.com/en/api/messages

---

## What This App Uses

Northstar §3b–§3c: **Layer 1 LLM** for:

1. **Task structuring** on capture (action type, category, effort, deadline, dependencies, recurrence flags).
2. **Batch reasoning** — all active tasks + behavioral profile + calendar **slot context** → ranked priorities, rationales, `scheduling_hint` (e.g. `deep_work_block`).
3. **Decomposition** and **weekly review insight** copy (lower volume).

**Model target (northstar):** **Claude Haiku** class for cost-efficient high-volume calls. Verify the live model string in the Anthropic dashboard when implementing (e.g. alias **`claude-haiku-4-5`** or dated snapshot per [models overview](https://docs.anthropic.com/en/docs/about-claude/models)).

---

## Authentication

- **Method:** API key header `x-api-key: ANTHROPIC_API_KEY`.
- **Where credentials live:** **`ANTHROPIC_API_KEY`** — **server-only** (Edge Function or secure backend). Never ship to the PWA client.

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});
```

---

## Key APIs / Methods

| Method | What it does | Key params | Returns |
| --- | --- | --- | --- |
| `POST /v1/messages` | Single turn or multi-turn | `model`, `max_tokens`, `system`, `messages[]` (`role` user/assistant, `content`) | `content` blocks, `stop_reason`, usage |
| Structured output | Constrain via prompt + JSON schema instructions | Validation gate (Layer 2) parses JSON; no trust without schema check | App-defined |

Northstar **Layer 2 validation gate** is deterministic — **never** let the LLM bypass hard safety rules (deadlines, max tasks, etc.).

---

## Webhook Events

None — request/response only.

---

## Environment Variables

| Variable | Scope | Description |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | server-only | Org/project API key |

---

## Rate Limits / Cost Model

- Pricing and TPM/RPM limits are tiered per Anthropic plan — confirm in Console.
- Northstar budget: ~**150–250 reasoning calls/month** per user + structuring calls; Haiku tier keeps unit economics in the documented **~$0.85/month AI** envelope.

---

## Integration Patterns for This Stack

- Invoke from **Supabase Edge Functions** or queue worker so the key never reaches the browser.
- **Batch** debounced task changes (northstar: **2-minute** debounce on rapid adds).
- **Log** `rationale_tier` (AI vs template fallback) for quality monitoring.
- **Calendar context** in prompts: only **time blocks**, not meeting titles (privacy).

---

## Gotchas / Known Issues

- **Model retirement:** Older Haiku 3 IDs have deprecation dates — pin and monitor [release notes](https://docs.anthropic.com/en/release-notes/api).
- **Output:** Request JSON in system prompt and validate with **zod** (or similar) before persisting; malformed output → template fallback per northstar.

---

## References

- https://docs.anthropic.com/en/api/messages
- https://docs.anthropic.com/en/docs/about-claude/models
