import { NextRequest } from "next/server";
import { generateContent } from "@/lib/openrouter";
import { ContentRequest } from "@/types/content";

export async function POST(request: NextRequest) {
  try {
    const body: ContentRequest = await request.json();

    if (!body.packages || body.packages.length === 0) {
      return Response.json(
        { error: "At least one package is required" },
        { status: 400 }
      );
    }

    const result = await generateContent(body);

    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
