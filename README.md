# Explain This Letter — MVP Backend (Vercel)

This repo contains a single serverless endpoint for Vercel:

- POST `/api/explain`
- Body: `{ "text": "...", "tone": "short" | "detailed" }`
- Returns: JSON with `meaning, actions, deadlines, consequences, suggested_reply, questions`

## Deploy (no local setup required)

1. Create accounts (free):
   - GitHub
   - Vercel

2. Create a new GitHub repo (e.g. `explain-this-letter`) and upload the files from this ZIP.

3. In Vercel:
   - Import the GitHub repo as a new project
   - Add Environment Variable:
     - `OPENAI_API_KEY` = your OpenAI API key
   - Deploy

Your endpoint will be:
`https://<project>.vercel.app/api/explain`

## Quick test (curl)

```bash
curl -X POST https://<project>.vercel.app/api/explain \
  -H "Content-Type: application/json" \
  -d '{"text":"Dear customer, your payment is due on Jan 10...","tone":"short"}'
```

## Notes

- CORS is set to `*` for MVP. Later, restrict `Access-Control-Allow-Origin` to your website domain.
- Input length is limited to protect costs.
