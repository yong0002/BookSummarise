import { SummaryForm } from "@/components/summary-form";

export default function Home() {
  return (
    <main className="page-shell">
      <div className="header">
        <h1>ChapterCut</h1>
        <p>Upload a PDF and get a summary</p>
      </div>
      <SummaryForm />
    </main>
  );
}
