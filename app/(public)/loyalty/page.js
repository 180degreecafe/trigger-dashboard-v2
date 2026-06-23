"use client";

import { useState } from "react";

const FUNCTIONS_BASE =
  "https://qwaooajgkkqtpbidzumd.supabase.co/functions/v1";

export default function CheckPointsPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const settings = result?.settings || {};
  const theme = settings?.theme || {
    background: "#F8F1E8",
    card: "#3B2F2F",
    accent: "#C89B3C",
    cream: "#FFF8EE",
    text: "#2A1E1A",
  };

  const customer = result?.customer || {};
  const loyalty = result?.loyalty || {};

  const normalizePhone = (value) =>
    String(value || "").replace(/[^\d+]/g, "").trim();

  const safeFetchJson = async (url, body) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    console.log("API URL:", url);
    console.log("API status:", res.status);
    console.log("API raw response:", text);

    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Response is not valid JSON");
    }

    if (!res.ok) {
      console.error("API returned error:", data);
    }

    return data;
  };

  const handleSendOtp = async () => {
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone) return;

    setLoading(true);
    setError("");

    try {
      const data = await safeFetchJson(`${FUNCTIONS_BASE}/send-otp`, {
        phone: cleanPhone,
      });

      if (data?.success) {
        setPhone(cleanPhone);
        setStep("otp");
      } else {
        setError(data?.error || "فشل في إرسال رمز التحقق.");
      }
    } catch (err) {
      console.error("send-otp error:", err);
      setError("حدث خطأ أثناء إرسال رمز التحقق.");
    }

    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone || !otp) return;

    setLoading(true);
    setError("");

    try {
      const data = await safeFetchJson(`${FUNCTIONS_BASE}/verify-otp`, {
        phone: cleanPhone,
        otp,
      });

      if (data?.verified) {
        await handleFetchLoyalty(cleanPhone);
      } else {
        setError(data?.error || "رمز التحقق غير صحيح.");
      }
    } catch (err) {
      console.error("verify-otp error:", err);
      setError("حدث خطأ أثناء التحقق.");
    }

    setLoading(false);
  };

  const handleFetchLoyalty = async (cleanPhone) => {
    try {
      const data = await safeFetchJson(`${FUNCTIONS_BASE}/get-loyalty-points`, {
        phone: cleanPhone,
        debug: false,
      });

      console.log("LOYALTY FINAL DATA:", data);

      setResult(data);
      setStep("result");

      if (!data?.found) {
        setError(
          `${data?.error || "لم يتم العثور على العميل"} ${
            data?.request_id ? `- Request ID: ${data.request_id}` : ""
          }`
        );
      }
    } catch (err) {
      console.error("get-loyalty-points error:", err);
      setResult({
        found: false,
        error: "فشل الاتصال بدالة الولاء",
      });
      setError("فشل الاتصال بدالة الولاء.");
      setStep("result");
    }
  };

  const formatAgo = (days) => {
    if (days === null || days === undefined) return "غير متوفر";
    if (days === 0) return "اليوم";
    if (days === 1) return "منذ يوم";
    if (days <= 10) return `منذ ${days} أيام`;
    return `منذ ${days} يوم`;
  };

  const getProgress = () => {
    const nextMin = loyalty?.next_level?.min_visits;
    const visits = loyalty?.visits || 0;
    if (!nextMin) return 100;
    return Math.min((visits / nextMin) * 100, 100);
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen px-4 py-6"
      style={{
        background: `radial-gradient(circle at top, ${theme.cream}, ${theme.background})`,
        color: theme.text,
      }}
    >
      <div className="max-w-md mx-auto space-y-5">
        {step !== "result" && (
          <div className="pt-10 text-center space-y-5">
            <h1 className="text-4xl font-extrabold">180°</h1>

            <div
              className="rounded-3xl p-6 shadow-xl border"
              style={{ background: theme.cream }}
            >
              <h2 className="text-2xl font-bold">تحقق من رحلتك ☕</h2>
              <p className="text-sm opacity-70 mt-2 mb-5">
                أدخل رقم جوالك لمعرفة نقاطك وإنجازاتك
              </p>

              {step === "phone" && (
                <>
                  <input
                    type="tel"
                    placeholder="مثال: 66334455"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-2xl border px-4 py-4 text-center text-lg bg-white outline-none"
                  />
                  <button
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full rounded-2xl py-4 mt-4 font-bold text-white disabled:opacity-60"
                    style={{ background: theme.accent }}
                  >
                    {loading ? "جارٍ الإرسال..." : "إرسال كود التحقق"}
                  </button>
                </>
              )}

              {step === "otp" && (
                <>
                  <input
                    type="text"
                    placeholder="أدخل الكود"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full rounded-2xl border px-4 py-4 text-center text-lg tracking-widest bg-white outline-none"
                  />
                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="w-full rounded-2xl py-4 mt-4 font-bold text-white disabled:opacity-60"
                    style={{ background: theme.card }}
                  >
                    {loading ? "جارٍ التحقق..." : "تحقق من الكود ✅"}
                  </button>
                </>
              )}

              {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
            </div>
          </div>
        )}

        {step === "result" && result && !result?.found && (
          <div
            className="rounded-3xl p-6 text-center shadow-xl mt-20"
            style={{ background: theme.cream }}
          >
            <h2 className="text-2xl font-bold text-red-600">
              لم يتم العثور على العميل
            </h2>
            <p className="text-sm opacity-70 mt-2">
              {result?.error || "تأكد من الرقم وحاول مرة أخرى."}
            </p>
            {result?.request_id && (
              <p className="text-xs mt-3 opacity-50">
                Request ID: {result.request_id}
              </p>
            )}
          </div>
        )}

        {step === "result" && result?.found && (
          <>
            <div className="text-center">
              <h1 className="text-3xl font-extrabold">
                {settings.page_title || "رحلتك مع 180°"}
              </h1>
              <p className="text-sm opacity-70 mt-1">
                {settings.welcome_text || "هلا فيك، هذه رحلتك مع 180°"}
              </p>
            </div>

            <div
              className="rounded-[2rem] p-6 shadow-2xl text-white relative overflow-hidden"
              style={{ background: theme.card }}
            >
              <div className="relative z-10">
                <p className="text-xs tracking-[0.25em] text-white/60">
                  {settings.card_title || "180° LOYALTY CARD"}
                </p>

                <div className="flex items-center justify-between mt-5">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {customer?.name || "ضيف 180°"}
                    </h2>
                    <p className="mt-2 text-sm text-white/75">
                      {loyalty?.current_level?.emoji || "☕"}{" "}
                      {loyalty?.current_level?.name || "مستكشف"}
                    </p>
                  </div>

                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                    style={{ background: theme.accent }}
                  >
                    ☕
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <Stat label="نقطة" value={loyalty?.points ?? 0} icon="⭐" />
                  <Stat label="زيارة" value={loyalty?.visits ?? 0} icon="☕" />
                </div>
              </div>
            </div>

            <div
              className="rounded-3xl p-5 shadow-xl"
              style={{ background: theme.cream }}
            >
              <p className="text-sm font-semibold opacity-70">
                🎯 {settings.next_goal_title || "هدفك القادم"}
              </p>

              <h3 className="text-2xl font-extrabold mt-2">
                {loyalty?.next_level?.emoji || "🏆"}{" "}
                {loyalty?.next_level?.name || "أعلى مستوى"}
              </h3>

              <p className="text-sm opacity-70 mt-1">
                {loyalty?.visits_to_next_level > 0
                  ? `باقي ${loyalty.visits_to_next_level} زيارة للوصول للمستوى التالي`
                  : "وصلت لأعلى مستوى حالياً"}
              </p>

              <div className="h-3 bg-black/10 rounded-full overflow-hidden mt-5">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${getProgress()}%`,
                    background: theme.accent,
                  }}
                />
              </div>

              {loyalty?.next_level?.min_visits && (
                <p className="text-center text-sm mt-2 opacity-70">
                  {loyalty.visits} / {loyalty.next_level.min_visits} زيارة
                </p>
              )}
            </div>

            {loyalty?.message && (
              <div
                className="rounded-3xl p-5 text-white text-center shadow-xl"
                style={{ background: theme.card }}
              >
                <h3 className="text-xl font-bold">{loyalty.message.title}</h3>
                <p className="text-sm text-white/80 mt-2 leading-7">
                  {loyalty.message.text}
                </p>
              </div>
            )}

            <div
              className="rounded-3xl p-5 shadow-xl"
              style={{ background: theme.cream }}
            >
              <h3 className="text-xl font-bold text-center mb-4">
                {settings.journey_title || "رحلتك مع 180°"}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <Mini label="مشروبك المفضل" value={loyalty.favorite_drink || "غير متوفر"} icon="❤️" />
                <Mini label="آخر زيارة" value={formatAgo(loyalty.days_since_last_visit)} icon="📅" />
                <Mini label="طلبات الماتشا" value={loyalty.matcha_count ?? 0} icon="🍵" />
                <Mini label="طلبات V60" value={loyalty.v60_count ?? 0} icon="🫘" />
              </div>
            </div>

            <div
              className="rounded-3xl p-5 shadow-xl"
              style={{ background: theme.cream }}
            >
              <h3 className="text-xl font-bold text-center mb-4">
                🏅 {settings.achievements_title || "إنجازاتك"}
              </h3>

              <div className="flex gap-3 overflow-x-auto pb-2">
                {(loyalty.achievements || []).map((a) => (
                  <Achievement key={a.code} a={a} accent={theme.accent} />
                ))}
              </div>
            </div>

            <a
              href={settings.order_button_url || "https://www.180-bh.com"}
              target="_blank"
              rel="noreferrer"
              className="block text-center rounded-full py-4 font-extrabold shadow-xl text-white"
              style={{ background: theme.accent }}
            >
              {settings.order_button_text || "اطلب الآن واجمع زيارات أكثر ☕"}
            </a>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, value, label }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 text-center">
      <div className="text-2xl">{icon}</div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
      <div className="text-xs text-white/70 mt-1">{label}</div>
    </div>
  );
}

function Mini({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
      <div className="text-2xl">{icon}</div>
      <p className="text-xs opacity-60 mt-2">{label}</p>
      <p className="text-sm font-bold mt-1">{value}</p>
    </div>
  );
}

function Achievement({ a, accent }) {
  const percent =
    a.target_value > 0 ? Math.min((a.progress / a.target_value) * 100, 100) : 0;

  return (
    <div className="min-w-[145px] rounded-2xl p-4 text-center border bg-white">
      <div className="text-3xl">{a.emoji}</div>
      <h4 className="font-bold text-sm mt-2">{a.name}</h4>
      <p className="text-xs opacity-60 mt-1 leading-5">{a.description}</p>

      {a.completed ? (
        <div className="mt-3 text-green-600 text-xl">✅</div>
      ) : (
        <div className="mt-3">
          <div className="h-2 bg-black/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${percent}%`, background: accent }}
            />
          </div>
          <p className="text-xs mt-2 font-bold">
            {a.progress} / {a.target_value}
          </p>
        </div>
      )}
    </div>
  );
}
