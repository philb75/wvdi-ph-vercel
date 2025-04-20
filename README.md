# WVDI-PH Vercel AI Chat Server

This is a Vercel-compatible serverless API for DriveBot, the AI-powered assistant for Western Visayas Driving Institute (WVDI).

## Features
- Serverless API endpoint at `/api/chat` for handling chat requests
- Integrates with OpenAI (ChatGPT) to answer user inquiries
- Uses a system prompt with up-to-date WVDI info
- Replies in the user's language

## Usage
- Deploy this repo to Vercel
- Set the environment variable `OPENAI_API_KEY` in your Vercel dashboard
- POST requests to `/api/chat` with `{ message, history, language }` in the JSON body

## Example POST body
```json
{
  "message": "What are your office hours?",
  "history": [],
  "language": "en"
}
```

## Environment Variables
- `OPENAI_API_KEY`: Your OpenAI secret key

---

**Deploy this repo to Vercel, set your OpenAI key, and connect your front-end chat widget to `/api/chat`.**
