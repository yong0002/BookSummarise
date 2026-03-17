import { NextResponse } from "next/server";

type ExtractResponse = {
  text?: string;
  title?: string;
  error?: string;
};

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    // Import implementation directly to avoid package entry debug path in this runtime.
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
    const pdfParse: any = require("pdf-parse/lib/pdf-parse.js");
    const parsed = await pdfParse(buffer);
    const fullText = (parsed?.text ?? "").toString();

    if (!fullText.trim()) {
      throw new Error("No text extracted from PDF");
    }

    return fullText.trim();
  } catch (error) {
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

function extractTextFromTxt(buffer: Buffer): string {
  return buffer.toString("utf-8");
}

function extractFilenameWithoutExt(filename: string): string {
  const parts = filename.split(".");
  parts.pop();
  return parts.join(".");
}

export async function POST(request: Request): Promise<NextResponse<ExtractResponse>> {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const filename = file.name.toLowerCase();
    const isPdf = filename.endsWith(".pdf");
    const isTxt = filename.endsWith(".txt");

    if (!isPdf && !isTxt) {
      return NextResponse.json({ error: "Only PDF and TXT files are supported." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";

    if (isPdf) {
      extractedText = await extractTextFromPdf(buffer);
    } else {
      extractedText = extractTextFromTxt(buffer);
    }

    if (!extractedText.trim()) {
      return NextResponse.json({ error: "The file appears to be empty." }, { status: 400 });
    }

    const title = extractFilenameWithoutExt(file.name);

    return NextResponse.json({ text: extractedText.trim(), title });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to extract text from file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
