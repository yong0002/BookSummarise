import { NextResponse } from "next/server";

import { buildFallbackSummary, type SummaryMode } from "@/lib/summarizer";

type SummarizeRequest = {
  title?: string;
  text?: string;
  mode?: SummaryMode;
};

const modeInstruction: Record<SummaryMode, string> = {
  quick: "Write a short, clear summary with 3 bullet points.",
  study: "Write a study-friendly summary with an overview, 5 bullet points, and 3 reflection questions.",
  actionable: "Write a practical summary with an overview, key lessons, and concrete actions the reader can apply.",
};

export async function POST(request: Request) {
  const body = (await request.json()) as SummarizeRequest;
  const title = body.title?.trim();
  const text = body.text?.trim();
  const mode = body.mode ?? "quick";

  if (!text) {
    return NextResponse.json({ error: "Paste book notes or an excerpt to summarize." }, { status: 400 });
  }

  if (text.length < 120) {
    return NextResponse.json(
      { error: "Add a longer excerpt or your own notes so the summary has enough context." },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ summary: buildFallbackSummary({ title, text, mode }), source: "fallback" });
  }

  const systemPrompt = [
    "You summarize books from user-provided notes or excerpts.",
    "Do not claim to know content that is not in the provided text.",
    "If the text looks incomplete, summarize only what is present.",
    "Keep the writing concrete and easy to skim.",
    modeInstruction[mode],
  ].join(" ");

  const userPrompt = [
    title ? `Book title: ${title}` : "Book title: not provided",
    "Summarize the following material.",
    text,
  ].join("\n\n");

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const fallback = buildFallbackSummary({ title, text, mode });
      return NextResponse.json({
        summary: fallback,
        source: "fallback",
        warning: "OpenAI quota or request issue. Returned local summary instead.",
      });
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const summary = data.choices?.[0]?.message?.content ?? "";

    if (!summary) {
      const fallback = buildFallbackSummary({ title, text, mode });
      return NextResponse.json({
        summary: fallback,
        source: "fallback",
        warning: "OpenAI returned empty content. Returned local summary instead.",
      });
    }

    return NextResponse.json({ summary, source: "openai" });
  } catch {
    const fallback = buildFallbackSummary({ title, text, mode });
    return NextResponse.json({
      summary: fallback,
      source: "fallback",
      warning: "OpenAI request failed. Returned local summary instead.",
    });
  }
}
