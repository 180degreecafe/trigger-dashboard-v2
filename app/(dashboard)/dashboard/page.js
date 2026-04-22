"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    active_campaigns: 0,
    messages_last_30_days: 0,
    total_response_rate: 0,
    best_campaign: "—",
    unresponsive_customers: 0,
  });

  const [insights, setInsights] = useState({
    topSegment: "—",
    avgResponseTime: "—",
    redeemedCount: 0,
  });

  useEffect(() => {
    checkSession();
    fetchData();
  }, []);

  // 🔐 حماية الصفحة
  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      router.push("/signin");
    }
  };

  // 📊 جلب البيانات
  const fetchData = async () => {
    try {
      const [
        { data: summaryArr },
        { data: insightsArr },
      ] = await Promise.all([
        supabase.rpc("get_dashboard_campaign_summary"),
        supabase.rpc("get_dashboard_insights"),
      ]);

      const summary = summaryArr?.[0];
      const insight = insightsArr?.[0];

      setStats({
        active_campaigns: summary?.active_campaigns ?? 0,
        messages_last_30_days: summary?.messages_last_30_days ?? 0,
        total_response_rate: summary?.total_response_rate ?? 0,
        best_campaign: summary?.best_campaign_name ?? "—",
        unresponsive_customers: summary?.unresponsive_customers ?? 0,
      });

      setInsights({
        topSegment: insight?.top_segment ?? "—",
        avgResponseTime: insight?.avg_response_time_hours
          ? `${insight.avg_response_time_hours}h`
          : "—",
        redeemedCount: insight?.redeemed_count ?? 0,
      });
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ⏳ Loading
  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white">

      <h1 className="text-3xl font-bold mb-6">
        📊 Dashboard
      </h1>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">

        <Card title="Active Campaigns" value={stats.active_campaigns} />
        <Card title="Messages (30d)" value={stats.messages_last_30_days} />
        <Card title="Response Rate" value={`${stats.total_response_rate}%`} />
        <Card title="Best Campaign" value={stats.best_campaign} />
        <Card title="Unresponsive" value={stats.unresponsive_customers} />

      </div>

      {/* Insights */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">

        <h2 className="text-xl font-semibold mb-4">
          🧠 Insights
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <Insight label="Top Segment" value={insights.topSegment} />
          <Insight label="Avg Response Time" value={insights.avgResponseTime} />
          <Insight label="Redeemed Codes" value={insights.redeemedCount} />

        </div>
      </div>
    </div>
  );
}

// 🔹 Components

function Card({ title, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function Insight({ label, value }) {
  return (
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}
