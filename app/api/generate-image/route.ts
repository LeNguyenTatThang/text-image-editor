import { NextRequest } from "next/server";
import {
  DesignRequest,
  DESIGN_LOCK_DATE_LABEL,
  generateDesignImage,
  isDesignFeatureAvailable,
} from "@/lib/imageDesign";

export async function POST(request: NextRequest) {
  try {
    if (!isDesignFeatureAvailable()) {
      return Response.json(
        {
          error: `Tính năng tạo thiết kế đã khóa từ ${DESIGN_LOCK_DATE_LABEL} vì API Recraft đóng.`,
        },
        { status: 403 }
      );
    }

    const body: DesignRequest = await request.json();

    if (!body.content || typeof body.content !== "string" || !body.content.trim()) {
      return Response.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const result = await generateDesignImage(body);

    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
