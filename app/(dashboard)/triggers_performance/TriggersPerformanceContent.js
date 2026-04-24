"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";

/* ---------- charts (no SSR) ---------- */
const Bar = dynamic(
  () => import("react-chartjs-2").then((m) => m.Bar),
  { ssr: false }
);
const Doughnut = dynamic(
  () => import("react-chartjs-2").then((m) => m.Doughnut),
  { ssr: false }
);

/* ---------- decision engine ---------- */
function getDecision(t) {
  if (t.roi >= 3 && t.conversion_rate >= 0.2) {
    return { label: "Scale", class: "bg-green-100 text-green-700" };
  }
  if (t.roi >= 1) {
    return { label: "Optimize", class: "bg-yellow-100 text-yellow-700" };
  }
  return { label: "Stop", class: "bg-red-100 text-red-700" };
}

/* ---------- format helpers ---------- */
const pct = (v) => `${Math.round((v || 0) * 100)}%`;
const money = (v) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "BHD" }).format(
    v || 0
  );

export default function TriggersPerformanceContent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- fetch ---------- */
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("trigger_performance_dashboard")
      .select("*")
      .order("roi", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setData(data || []);
    }

    setLoading(false);
  };

  /* ---------- KPIs ---------- */
  const kpis = useMemo(() => {
    if (!data.length) return {};

    const best = [...data].sort((a, b) => b.roi - a.roi)[0];
    const worst = [...data].sort((a, b) => a.roi - b.roi)[0];
    const totalRevenue = data.reduce((s, d) => s + (d.total_revenue || 0), 0);
    const avgConversion =
      data.reduce((s, d) => s + (d.conversion_rate || 0), 0) / data.length;

    return { best, worst, totalRevenue, avgConversion };
  }, [data]);

  /* ---------- charts ---------- */
  const roiChart = useMemo(() => {
    if (!data.length) return null;

    return {
      labels: data.map((d) => d.trigger_type),
      datasets: [
        {
          label: "ROI",
          data: data.map((d) => d.roi),
        },
      ],
    };
  }, [data]);

  const revenueChart = useMemo(() => {
    if (!data.length) return null;

    return {
      labels: data.map((d) => d.trigger_type),
      datasets: [
        {
          data: data.map((d) => d.total_revenue),
        },
      ],
    };
  }, [data]);

  /* ---------- UI ---------- */

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          Triggers Performance
        </h1>
        <p className="text-sm text-gray-500">
          Optimize your marketing decisions
        </p>
      </div>

      {/* KPIs */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

          <div className="card">
            <div className="text-sm text-gray-500">Best Trigger</div>
            <div className="font-semibold">{kpis.best?.trigger_type}</div>
            <div className="text-green-600 text-sm">
              ROI: {kpis.best?.roi?.toFixed(2)}
            </div>
          </div>

          <div className="card">
            <div className="text-sm text-gray-500">Worst Trigger</div>
            <div className="font-semibold">{kpis.worst?.trigger_type}</div>
            <div className="text-red-600 text-sm">
              ROI: {kpis.worst?.roi?.toFixed(2)}
            </div>
          </div>

          <div className="card">
            <div className="text-sm text-gray-500">Total Revenue</div>
            <div className="text-xl font-bold">
              {money(kpis.totalRevenue)}
            </div>
          </div>

          <div className="card">
            <div className="text-sm text-gray-500">Avg Conversion</div>
            <div className="text-xl font-bold">
              {pct(kpis.avgConversion)}
            </div>
          </div>

        </div>
      )}

      {/* Charts */}
      {!loading && (
        <div className="grid md:grid-cols-2 gap-6 mb-6">

          <div className="card">
            <h3 className="text-sm font-medium mb-2">ROI by Trigger</h3>
            {roiChart && <Bar data={roiChart} />}
          </div>

          <div className="card">
            <h3 className="text-sm font-medium mb-2">
              Revenue Contribution
            </h3>
            {revenueChart && <Doughnut data={revenueChart} />}
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

                    <td className="font-semibold">
                      {t.roi?.toFixed(2)}
                    </td>

                    <td>{pct(t.conversion_rate)}</td>

                    <td className="text-green-600">
                      {money(t.total_revenue)}
                    </td>

                    <td
                      className={
                        t.profit > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {money(t.profit)}
                    </td>

                    <td>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${decision.class}`}
                      >
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

      {/* Insights */}
      {!loading && data.length > 0 && (
        <div className="card mt-6">
          <h3 className="text-sm font-semibold mb-2">
            Insights
          </h3>

          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              • {kpis.best?.trigger_type} is your most profitable trigger
            </li>
            <li>
              • {kpis.worst?.trigger_type} needs review or shutdown
            </li>
            <li>
              • Focus on high ROI triggers to scale revenue
            </li>
          </ul>
        </div>
      )}

    </div>
  );
}
