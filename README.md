# ChapterCut

ChapterCut is a small Next.js website for turning book notes and short excerpts into readable summaries.

## What it does

- Paste your own notes, highlights, or a short excerpt
- Pick a summary mode: Quick, Study, or Actionable
- Generate a summary with a local fallback summarizer
- Upgrade to OpenAI-backed summaries by setting an API key

## Tech stack

- Next.js 16
- React 19
- TypeScript
- App Router

## Local development

1. Install dependencies:
   `npm install`
2. Start the dev server:
   `npm run dev`
3. Open `http://localhost:3000`

## OpenAI mode

Create a `.env.local` file from `.env.example` and set:

`OPENAI_API_KEY=your_key_here`
I currently do not possess any api key so feel free to use it on ur own API key

If no API key is present, the app still works with a local fallback summarizer.

## Notes

This project is designed for summarizing your own notes or legally provided excerpts. It should not be used to process full copyrighted books that you do not have rights to reproduce.
