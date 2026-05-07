// src/app/api/audit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { runAudit, FormInput } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body: FormInput = await req.json();

    if (!body.tools || !Array.isArray(body.tools) || body.tools.length === 0) {
      return NextResponse.json({ error: "No tools provided" }, { status: 400 });
    }

    if (!body.teamSize || body.teamSize < 1) {
      return NextResponse.json({ error: "Invalid team size" }, { status: 400 });
    }

    const result = runAudit(body);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Audit engine error:", err);
    return NextResponse.json({ error: "Audit failed" }, { status: 500 });
  }
}
