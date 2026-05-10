// src/app/share/[id]/page.tsx
import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import SharePageClient from "./SharePageClient";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase
    .from("audits")
    .select("total_monthly_savings, total_current_spend")
    .eq("id", id)
    .single();

  if (!data) return { title: "Leakr — AI Spend Audit" };

  const savings = Math.round(data.total_monthly_savings);
  const current = Math.round(data.total_current_spend);

  return {
    title: `Leakr — $${savings}/mo in AI waste found`,
    description: `This team is spending $${current}/mo on AI tools and could save $${savings}/mo. See the full breakdown.`,
    openGraph: {
      title: `Leakr found $${savings}/mo in AI waste`,
      description: `$${current}/mo current spend → $${current - savings}/mo optimised. Full audit breakdown inside.`,
      url: `https://leakr.vercel.app/share/${id}`,
      siteName: "Leakr",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `Leakr found $${savings}/mo in AI waste`,
      description: `$${current}/mo current spend → $${current - savings}/mo optimised. Run your free audit.`,
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { id } = await params;
  const { data, error } = await supabase
    .from("audits")
    .select("audit_result, ai_summary, total_monthly_savings, total_current_spend, created_at")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  // Strip any identifying info — only show tool names + savings
  const safeResult = {
    ...data.audit_result,
    aiSummary: data.ai_summary,
  };

  return <SharePageClient result={safeResult} />;
}