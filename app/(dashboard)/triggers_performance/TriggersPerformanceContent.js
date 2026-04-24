"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";

/* ---------- chart.js ---------- */
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

/* ---------- charts ---------- */
const Bar = dynamic(() => import("react-chartjs-2").then((m) => m.Bar), { ssr: false });
const Doughnut = dynamic(() => import("react-chartjs-2").then((m) => m.Doughnut), { ssr: false });

/* ---------- helpers ---------- */
const safe = (v) => {
  const n = Number(v);
  return isFinite(n) ? n : 0;
};

const pct = (v) => `${safe(v).toFixed(1)}%`; // ✅ لأن SQL already *100

const money = (v) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "BHD",
  }).format(safe(v));

/* ---------- colors ---------- */
const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#6366f1",
  "#f97316",
  "#22c55e",
  "#e11d48",
];

/* ---------- decision ---------- */
function getDecision(t) {
  const roi = safe(t.roi);
  const conv = safe(t.conversion_rate) / 100;

  if (roi >= 3 && conv >= 0.2) {
    return { label: "Scale", class: "bg-green-100 text-green-700" };
  }
  if (roi >= 1) {
    return { label: "Optimize", class: "bg-yellow-100 text-yellow-700" };
  }
  return { label: "Stop", class: "bg-red-100 text-red-700" };
}

/* ---------- page ---------- */
export default function TriggersPerformanceContent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  /* 🔥 NEW: range state */
  const [range, setRange] = useState("30d");

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from(`trigger_performance_${range}`)
      .select("*")
      .order("roi", { ascending: false });

    if (!error) {
      setData(data || []);
    } else {
      console.error(error);
    }

    setLoading(false);
  };

  /* ---------- KPIs ---------- */
  const kpis = useMemo(() => {
    if (!data.length) return null;

    const sorted = [...data].sort((a, b) => safe(b.roi) - safe(a.roi));

    return {
      best: sorted[0],
      worst: sorted[sorted.length - 1],
      totalRevenue: data.reduce((s, d) => s + safe(d.total_revenue), 0),
      totalRedeemed: data.reduce((s, d) => s + safe(d.total_redeemed), 0),
      avgConversion:
        data.reduce((s, d) => s + safe(d.conversion_rate), 0) / data.length,
    };
  }, [data]);

  /* ---------- charts ---------- */
  const roiChart = {
    labels: data.map((d) => d.trigger_type),
    datasets: [
      {
        label: "ROI",
        data: data.map((d) => safe(d.roi)),
        backgroundColor: COLORS,
        borderRadius: 6,
      },
    ],
  };

  const revenueChart = {
    labels: data.map((d) => d.trigger_type),
    datasets: [
      {
        data: data.map((d) => safe(d.total_revenue)),
        backgroundColor: COLORS,
      },
    ],
  };

  /* ---------- UI ---------- */
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">
            Triggers Performance
          </h1>
          <p className="text-sm text-gray-500">
            Optimize marketing decisions
          </p>
        </div>

        {/* 🔥 RANGE TOGGLE */}
        <div className="flex gap-2">
          {["7d", "30d", "90d"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-sm rounded-md ${
                range === r
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      {!loading && kpis && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">

          <div className="card p-4">
            <div className="text-xs text-gray-500 mb-1">Best Trigger</div>
            <div className="font-semibold">{kpis.best?.trigger_type}</div>
            <div className="text-green-600 text-sm">
              ROI {safe(kpis.best?.roi).toFixed(2)}
            </div>
          </div>

          <div className="card p-4">
            <div className="text-xs text-gray-500 mb-1">Worst Trigger</div>
            <div className="font-semibold">{kpis.worst?.trigger_type}</div>
            <div className="text-red-600 text-sm">
              ROI {safe(kpis.worst?.roi).toFixed(2)}
            </div>
          </div>

          <div className="card p-4">
            <div className="text-xs text-gray-500 mb-1">
              Total Revenue
            </div>
            <div className="text-lg font-bold">
              {money(kpis.totalRevenue)}
            </div>
          </div>

          <div className="card p-4">
            <div className="text-xs text-gray-500 mb-1">
              Total Redeemed
            </div>
            <div className="text-lg font-bold">
              {kpis.totalRedeemed}
            </div>
          </div>

          <div className="card p-4">
            <div className="text-xs text-gray-500 mb-1">
              Avg Conversion
            </div>
            <div className="text-lg font-bold">
              {pct(kpis.avgConversion)}
            </div>
          </div>

        </div>
      )}

      {/* Charts */}
      {!loading && data.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">

          <div className="card p-4">
            <h3 className="text-sm font-medium mb-4">
              ROI by Trigger
            </h3>
            <Bar data={roiChart} />
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-medium mb-4">
              Revenue Distribution
            </h3>
            <Doughnut data={revenueChart} />
          </div>

        </div>
      )}

      {/* Table */}
      <div className="card overflow-x-auto">
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : (
          <table className="w-full text-sm">

            <thead className="border-b text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Trigger</th>
                <th>ROI</th>
                <th>Conversion</th>
                <th>Revenue</th>
                <th>Profit</th>
                <th>Decision</th>
              </tr>
            </thead>

            <tbody>
              {data.map((t) => {
                const decision = getDecision(t);

                return (
                  <tr key={t.trigger_type} className="border-b">
                    <td className="px-4 py-3 font-medium">
                      {t.trigger_type}
                    </td>

                    <td>{safe(t.roi).toFixed(2)}</td>
                    <td>{pct(t.conversion_rate)}</td>

                    <td className="text-green-600">
                      {money(t.total_revenue)}
                    </td>

                    <td className={safe(t.profit) > 0 ? "text-green-600" : "text-red-600"}>
                      {money(t.profit)}
                    </td>

                    <td>
                      <span className={`px-2 py-1 text-xs rounded-full ${decision.class}`}>
                        {decision.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        )}
      </div>
    </div>
  );
}
