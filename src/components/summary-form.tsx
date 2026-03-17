"use client";

import { useRef, useState } from "react";

type SummaryResponse = {
  summary?: string;
  error?: string;
};

type ExtractResponse = {
  text?: string;
  title?: string;
  error?: string;
};

export function SummaryForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setError("");
    setText("");
    setSummary("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as ExtractResponse;

      if (!response.ok || data.error) {
        throw new Error(data.error ?? "Failed to extract text from file.");
      }

      if (data.text) {
        setText(data.text);
      }
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Unexpected error";
      setError(message);
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, mode: "study" }),
      });

      const data = (await response.json()) as SummaryResponse;

      if (!response.ok || data.error) {
        throw new Error(data.error ?? "Failed to generate summary.");
      }

      setSummary(data.summary ?? "");
    } catch (submissionError) {
      const message = submissionError instanceof Error ? submissionError.message : "Unexpected error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app-container">
      <form className="input-section" onSubmit={handleSubmit}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          disabled={isExtracting}
          className="file-input"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isExtracting}
          className="select-button"
        >
          {isExtracting ? "Reading..." : "Select PDF"}
        </button>

        {text && (
          <button className="generate-button" disabled={isLoading} type="submit">
            {isLoading ? "Generating..." : "Summarize"}
          </button>
        )}

        {error && <div className="error-message">{error}</div>}
      </form>

      {summary && (
        <div className="summary-section">
          <pre className="summary-text">{summary}</pre>
        </div>
      )}
    </div>
  );
}
