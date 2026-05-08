// src/app/api/audit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { runAudit, FormInput } from "@/lib/audit";
import { generateSummary } from "@/lib/summary";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body: FormInput = await req.json();

    if (!body.tools || !Array.isArray(body.tools) || body.tools.length === 0) {
      return NextResponse.json({ error: "No tools provided" }, { status: 400 });
    }
    if (!body.teamSize || body.teamSize < 1) {
      return NextResponse.json({ error: "Invalid team size" }, { status: 400 });
    }

    // 1. Run audit engine
    const result = runAudit(body);

    // 2. Generate AI summary (Groq, with automatic fallback)
    const aiSummary = await generateSummary(body, result);

    // 3. Persist to Supabase → get shareId
    const { data, error } = await supabase
      .from("audits")
      .insert({
        form_input: body,
        audit_result: result,
        ai_summary: aiSummary,
        total_monthly_savings: result.totalMonthlySavings,
        total_current_spend: result.totalCurrentSpend,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      // Graceful degradation — audit still works, just no share URL
      return NextResponse.json({ ...result, aiSummary, shareId: null });
    }

    return NextResponse.json({ ...result, aiSummary, shareId: data.id });
  } catch (err) {
    console.error("Audit engine error:", err);
    return NextResponse.json({ error: "Audit failed" }, { status: 500 });
  }
}
