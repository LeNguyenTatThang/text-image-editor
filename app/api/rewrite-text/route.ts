import { NextRequest } from "next/server";
import { rewriteText } from "@/lib/openrouter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.text || typeof body.text !== "string") {
      return Response.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const result = await rewriteText(body.text, body.context);

    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
