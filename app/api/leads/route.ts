// src/app/api/leads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple rate limit store (in-memory, resets on server restart)
// For production use Upstash Redis, but this covers the assignment
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 }); // 1 min window
    return false;
  }

  if (entry.count >= 3) return true; // max 3 submissions per minute per IP

  entry.count++;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, company, role, shareId, monthlySavings, honeypot } = body;

    // 1. Honeypot check
    if (honeypot) {
      // Bot detected — return 200 to not reveal detection
      return NextResponse.json({ ok: true });
    }

    // 2. Rate limit check
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // 3. Basic validation
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // 4. Save lead to Supabase
    const { error: dbError } = await supabase.from("leads").insert({
      email,
      company: company || null,
      role: role || null,
      share_id: shareId || null,
      monthly_savings: monthlySavings || 0,
      high_value: monthlySavings > 500,
    });

    if (dbError) {
      console.error("Supabase leads insert error:", dbError);
      // Don't fail — still send email even if DB fails
    }

    // 5. Send confirmation email via Resend
    const isHighValue = monthlySavings > 500;
    const fmt = (n: number) =>
      n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

    await resend.emails.send({
      from: "Leakr <onboarding@resend.dev>", // update with your verified domain
      to: email,
      subject: isHighValue
        ? `Your Leakr audit — ${fmt(monthlySavings)}/mo in savings found`
        : "Your Leakr AI spend audit",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin:0;padding:0;background:#0a0e1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
            
            <div style="margin-bottom:32px;">
              <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">leakr</span>
            </div>

            ${isHighValue ? `
            <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:24px;margin-bottom:28px;">
              <p style="margin:0 0 4px;font-size:12px;color:#6ee7b7;font-weight:600;text-transform:uppercase;letter-spacing:1px;">savings found</p>
              <p style="margin:0;font-size:36px;font-weight:700;color:#34d399;">${fmt(monthlySavings)}/mo</p>
              <p style="margin:8px 0 0;font-size:14px;color:#94a3b8;">that's ${fmt(monthlySavings * 12)}/year — here's how to capture it.</p>
            </div>
            ` : `
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:28px;">
              <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;">Your audit is complete</p>
              <p style="margin:8px 0 0;font-size:14px;color:#94a3b8;">Your AI stack looks well-optimised. We'll notify you when new savings apply.</p>
            </div>
            `}

            ${shareId ? `
            <div style="margin-bottom:28px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://leakr.vercel.app'}/share/${shareId}" 
                 style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:600;">
                View your full audit →
              </a>
            </div>
            ` : ""}

            ${isHighValue ? `
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:28px;">
              <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#ffffff;">Want to capture these savings faster?</p>
              <p style="margin:0 0 16px;font-size:13px;color:#94a3b8;line-height:1.6;">
                Credex sells discounted AI credits for Claude, Cursor, and ChatGPT — same tools you're already using, at a lower cost. Our team will reach out shortly.
              </p>
              <a href="https://credex.rocks" style="color:#34d399;font-size:13px;font-weight:600;text-decoration:none;">
                Learn about Credex →
              </a>
            </div>
            ` : ""}

            <div style="border-top:1px solid rgba(255,255,255,0.05);padding-top:20px;">
              <p style="margin:0;font-size:12px;color:#475569;line-height:1.6;">
                You're receiving this because you ran an audit on leakr.ai.<br>
                <a href="#" style="color:#475569;">Unsubscribe</a>
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Leads route error:", err);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}