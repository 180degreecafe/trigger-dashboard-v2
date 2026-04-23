"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CampaignResponsesContent() {
  const searchParams = useSearchParams();
  const campaign_id = searchParams.get("campaign_id");

  const [responses, setResponses] = useState([]);
  const [campaignName, setCampaignName] = useState("");
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    redeemed: 0,
    rate: 0,
    avgResponseTime: null,
    lastRedemption: null,
  });

  /* ---------- fetch ---------- */

  useEffect(() => {
    if (!campaign_id) return;

    const fetchData = async () => {
      setLoading(true);

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

      const list = data || [];
      setResponses(list);

      /* ---------- stats ---------- */

      const total = list.length;
      const redeemed = list.filter((r) => r.status === "redeemed").length;
      const rate = total ? Math.round((redeemed / total) * 100) : 0;

      const times = list
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

      const lastRedemption = list
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

      setLoading(false);
    };

    fetchData();
  }, [campaign_id]);

  /* ---------- UI ---------- */

  if (loading) {
    return <div className="p-6 text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">
            {campaignName}
          </h1>
          <p className="text-sm text-gray-500">
            Campaign responses & performance
          </p>
        </div>

        <a
          href="/campaigns"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">

        <Stat title="Customers" value={stats.total} />
        <Stat title="Redeemed" value={stats.redeemed} />
        <Stat title="Rate" value={`${stats.rate}%`} />
        <Stat
          title="Avg Time"
          value={
            stats.avgResponseTime
              ? `${stats.avgResponseTime} min`
              : "-"
          }
        />
        <Stat
          title="Last"
          value={
            stats.lastRedemption
              ? stats.lastRedemption.toLocaleString()
              : "-"
          }
        />

      </div>

      {/* Table / Mobile */}
      <div className="card overflow-hidden">

        {responses.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No responses yet
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
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

                      <td className="px-4 py-3">
                        {r.customer_id}
                      </td>

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
            </div>

            {/* Mobile */}
            <div className="md:hidden space-y-3 p-3">
              {responses.map((r, i) => (
                <div key={i} className="border p-4 rounded-lg">

                  <div className="font-medium">
                    {r.customer_id}
                  </div>

                  <div className="text-xs text-blue-600 font-mono mb-2">
                    {r.offer_code}
                  </div>

                  <StatusBadge status={r.status} />

                  <div className="text-xs text-gray-500 mt-2">
                    Sent: {formatDate(r.sent_at)}
                  </div>

                  <div className="text-xs text-gray-500">
                    Redeemed: {formatDate(r.redeemed_at)}
                  </div>

                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- components ---------- */

function Stat({ title, value }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    redeemed: "bg-green-100 text-green-700",
    sent: "bg-yellow-100 text-yellow-700",
    pending: "bg-gray-100 text-gray-700",
  };

  return (
    <span className={`badge ${map[status] || "badge-default"}`}>
      {status}
    </span>
  );
}

function formatDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleString("en-GB");
}
