"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CampaignResponsesPage() {
  const params = useSearchParams();
  const router = useRouter();
  const campaign_id = params.get("campaign_id");

  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaignName, setCampaignName] = useState("");

  const [stats, setStats] = useState({
    total: 0,
    redeemed: 0,
    rate: 0,
    avgResponseTime: null,
    lastRedemption: null,
  });

  useEffect(() => {
    if (!campaign_id) return;

    const fetchData = async () => {
      const { data: campaignData } = await supabase
        .from("campaigns")
        .select("name")
        .eq("id", campaign_id)
        .single();

      setCampaignName(campaignData?.name || "Campaign");

      const { data } = await supabase
        .from("campaign_responses")
        .select(
          "customer_id, offer_code, sent_at, redeemed_at, channel, status"
        )
        .eq("campaign_id", campaign_id)
        .order("sent_at", { ascending: false });

      if (data) {
        setResponses(data);

        const total = data.length;
        const redeemed = data.filter((r) => r.status === "redeemed").length;
        const rate = total ? Math.round((redeemed / total) * 100) : 0;

        const times = data
          .filter((r) => r.sent_at && r.redeemed_at)
          .map(
            (r) =>
              new Date(r.redeemed_at) - new Date(r.sent_at)
          );

        const avgResponseTime =
          times.length > 0
            ? Math.round(
                times.reduce((a, b) => a + b, 0) /
                  times.length /
                  1000 /
                  60
              )
            : null;

        const lastRedemption = data
          .filter((r) => r.redeemed_at)
          .map((r) => new Date(r.redeemed_at))
          .sort((a, b) => b - a)[0];

        setStats({
          total,
          redeemed,
          rate,
          avgResponseTime,
          lastRedemption,
        });
      }

      setLoading(false);
    };

    fetchData();
  }, [campaign_id]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">
            Campaign Responses
          </h1>
          <p className="text-sm text-gray-500">
            {campaignName}
          </p>
        </div>

        <button
          onClick={() => router.back()}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading...
        </div>
      ) : responses.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No responses yet
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

            <Stat title="Customers" value={stats.total} />

            <Stat title="Redemptions" value={stats.redeemed} />

            <Stat title="Rate" value={`${stats.rate}%`} />

            <Stat
              title="Avg Time"
              value={
                stats.avgResponseTime
                  ? `${stats.avgResponseTime} min`
                  : "—"
              }
            />

            {stats.lastRedemption && (
              <div className="card col-span-2 md:col-span-4">
                <div className="text-xs text-gray-500">
                  Last Redemption
                </div>
                <div className="font-semibold">
                  {stats.lastRedemption.toLocaleString("en-GB")}
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="card overflow-x-auto">

            {/* Desktop */}
            <table className="w-full text-sm hidden md:table">
              <thead className="border-b text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th>Code</th>
                  <th>Channel</th>
                  <th>Status</th>
                  <th>Sent</th>
                  <th>Redeemed</th>
                </tr>
              </thead>

              <tbody>
                {responses.map((r, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-4 py-3">{r.customer_id}</td>

                    <td className="font-mono text-blue-600">
                      {r.offer_code}
                    </td>

                    <td>{r.channel}</td>

                    <td>
                      <StatusBadge status={r.status} />
                    </td>

                    <td className="text-xs text-gray-500">
                      {formatDate(r.sent_at)}
                    </td>

                    <td className="text-xs text-gray-500">
                      {formatDate(r.redeemed_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile */}
            <div className="md:hidden space-y-3 p-3">
              {responses.map((r, i) => (
                <div key={i} className="border rounded-lg p-4">

                  <div className="flex justify-between mb-2">
                    <span className="font-medium">
                      {r.customer_id}
                    </span>
                    <StatusBadge status={r.status} />
                  </div>

                  <div className="text-sm text-blue-600 font-mono mb-2">
                    {r.offer_code}
                  </div>

                  <div className="text-xs text-gray-500">
                    {r.channel}
                  </div>

                  <div className="text-xs text-gray-400 mt-2">
                    Sent: {formatDate(r.sent_at)}
                  </div>

                  <div className="text-xs text-gray-400">
                    Redeemed: {formatDate(r.redeemed_at)}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </>
      )}
    </div>
  );
}

/* ---------- components ---------- */

function Stat({ title, value }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    redeemed: "bg-green-100 text-green-700",
    sent: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded-full ${
        styles[status] || "bg-gray-200"
      }`}
    >
      {status}
    </span>
  );
}

function formatDate(date) {
  return date
    ? new Date(date).toLocaleString("en-GB")
    : "-";
}
