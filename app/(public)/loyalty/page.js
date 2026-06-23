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

  const theme = result?.settings?.theme || {
    background: "#F8F1E8",
    card: "#3B2F2F",
    accent: "#C89B3C",
    cream: "#FFF8EE",
    text: "#2A1E1A",
  };

  const settings = result?.settings || {};

  const handleSendOtp = async () => {
    if (!phone) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${FUNCTIONS_BASE}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (data.success) {
        setStep("otp");
      } else {
        setError("فشل في إرسال رمز التحقق. حاول مرة أخرى.");
      }
    } catch {
      setError("حدث خطأ أثناء الإرسال.");
    }

    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${FUNCTIONS_BASE}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();

      if (data.verified) {
        await handleFetchPoints();
      } else {
        setError("رمز التحقق غير صحيح.");
      }
    } catch {
      setError("حدث خطأ أثناء التحقق.");
    }

    setLoading(false);
  };

  const handleFetchPoints = async () => {
    try {
      const res = await fetch(`${FUNCTIONS_BASE}/get-loyalty-points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      setResult(data);
      setStep("result");
    } catch {
      setResult({ found: false });
      setStep("result");
    }
  };

  const formatDateAgo = (days) => {
    if (days === null || days === undefined) return "غير متوفر";
    if (days === 0) return "اليوم";
    if (days === 1) return "منذ يوم";
    if (days <= 10) return `منذ ${days} أيام`;
    return `منذ ${days} يوم`;
  };

  const progressPercent = (progress, target) => {
    if (!target || target <= 0) return 0;
    return Math.min((progress / target) * 100, 100);
  };

  const loyalty = result?.loyalty;
  const customer = result?.customer;

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
          <div className="text-center pt-10 space-y-5">
            <div>
              <h1 className="text-4xl font-extrabold tracking-wide">180°</h1>
              <p className="text-sm opacity-70 mt-1">Coffee & Loyalty</p>
            </div>

            <div
              className="rounded-3xl p-6 shadow-xl border"
              style={{
                background: theme.cream,
                borderColor: "rgba(0,0,0,0.06)",
              }}
            >
              <h2 className="text-2xl font-bold mb-2">
                تحقق من رحلتك ☕
              </h2>
              <p className="text-sm opacity-70 mb-5">
                أدخل رقم جوالك لمعرفة نقاطك وإنجازاتك مع 180°
              </p>

              {step === "phone" && (
                <div className="space-y-4">
                  <input
                    type="tel"
                    placeholder="مثال: 66334455"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-2xl border px-4 py-4 text-center text-lg bg-white outline-none"
                    style={{ borderColor: "#E4D6C5" }}
                  />

                  <button
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full rounded-2xl py-4 font-bold text-white shadow-md disabled:opacity-60"
                    style={{ background: theme.accent }}
                  >
                    {loading ? "جارٍ الإرسال..." : "إرسال كود التحقق"}
                  </button>
                </div>
              )}

              {step === "otp" && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="أدخل الكود هنا"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full rounded-2xl border px-4 py-4 text-center text-lg tracking-widest bg-white outline-none"
                    style={{ borderColor: "#E4D6C5" }}
                  />

                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="w-full rounded-2xl py-4 font-bold text-white shadow-md disabled:opacity-60"
                    style={{ background: theme.card }}
                  >
                    {loading ? "جارٍ التحقق..." : "تحقق من الكود ✅"}
                  </button>
                </div>
              )}

              {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
            </div>
          </div>
        )}

        {step === "result" && result && !result.found && (
          <div
            className="rounded-3xl p-6 text-center shadow-xl mt-20"
            style={{ background: theme.cream }}
          >
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              لم يتم العثور على العميل
            </h2>
            <p className="text-sm opacity-70">
              تأكد من الرقم وحاول مرة أخرى.
            </p>
          </div>
        )}

        {step === "result" && result?.found && loyalty && (
          <>
            {/* Header */}
            <div className="text-center pt-2">
              <h1 className="text-3xl font-extrabold">
                {settings.page_title || "رحلتك مع 180°"}
              </h1>
              <p className="text-sm opacity-70 mt-1">
                {settings.welcome_text || "هلا فيك، هذه رحلتك مع 180°"}
              </p>
            </div>

            {/* Premium Card */}
            <div
              className="rounded-[2rem] p-6 shadow-2xl text-white relative overflow-hidden"
              style={{ background: theme.card }}
            >
              <div className="absolute -top-10 -left-10 w-36 h-36 rounded-full bg-white/5" />
              <div className="absolute -bottom-12 -right-12 w-44 h-44 rounded-full bg-white/5" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs tracking-[0.25em] text-white/60">
                      {settings.card_title || "180° LOYALTY CARD"}
                    </p>
                    <h2 className="text-2xl font-bold mt-2">
                      {customer?.name || "ضيف 180°"}
                    </h2>
                    <p className="mt-1 text-sm text-white/75">
                      {loyalty.current_level?.emoji}{" "}
                      {loyalty.current_level?.name || "مستكشف"}
                    </p>
                  </div>

                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-inner"
                    style={{ background: theme.accent }}
                  >
                    ☕
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <StatBox label="نقطة" value={loyalty.points} icon="⭐" />
                  <StatBox label="زيارة" value={loyalty.visits} icon="☕" />
                </div>
              </div>
            </div>

            {/* Next Goal */}
            <div
              className="rounded-3xl p-5 shadow-xl border"
              style={{
                background: theme.cream,
                borderColor: "rgba(0,0,0,0.06)",
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold opacity-70">
                    🎯 {settings.next_goal_title || "هدفك القادم"}
                  </p>
                  <h3 className="text-2xl font-extrabold mt-1">
                    {loyalty.next_level?.emoji}{" "}
                    {loyalty.next_level?.name || "أعلى مستوى"}
                  </h3>
                  <p className="text-sm opacity-70 mt-1">
                    {loyalty.visits_to_next_level > 0
                      ? `باقي ${loyalty.visits_to_next_level} زيارة للوصول للمستوى التالي`
                      : "وصلت لأعلى مستوى حالياً"}
                  </p>
                </div>

                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                  style={{ background: `${theme.accent}25` }}
                >
                  🏆
                </div>
              </div>

              {loyalty.next_level && (
                <div className="mt-5">
                  <div className="h-3 bg-black/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progressPercent(
                          loyalty.visits,
                          loyalty.next_level.min_visits
                        )}%`,
                        background: theme.accent,
                      }}
                    />
                  </div>

                  <p className="text-center text-sm mt-2 opacity-70">
                    {loyalty.visits} / {loyalty.next_level.min_visits} زيارة
                  </p>
                </div>
              )}
            </div>

            {/* Personalized Message */}
            {loyalty.message && (
              <div
                className="rounded-3xl p-5 text-white shadow-xl relative overflow-hidden"
                style={{ background: theme.card }}
              >
                <div className="absolute inset-0 bg-gradient-to-l from-white/10 to-transparent" />
                <div className="relative z-10 text-center">
                  <h3 className="text-xl font-bold">
                    {loyalty.message.title}
                  </h3>
                  <p className="text-sm text-white/80 mt-2 leading-7">
                    {loyalty.message.text}
                  </p>
                </div>
              </div>
            )}

            {/* Journey */}
            <div
              className="rounded-3xl p-5 shadow-xl border"
              style={{
                background: theme.cream,
                borderColor: "rgba(0,0,0,0.06)",
              }}
            >
              <h3 className="text-xl font-bold text-center mb-4">
                {settings.journey_title || "رحلتك مع 180°"}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <MiniInfo
                  icon="❤️"
                  label="مشروبك المفضل"
                  value={loyalty.favorite_drink || "غير متوفر"}
                />
                <MiniInfo
                  icon="📅"
                  label="آخر زيارة"
                  value={formatDateAgo(loyalty.days_since_last_visit)}
                />
                <MiniInfo
                  icon="🍵"
                  label="طلبات الماتشا"
                  value={loyalty.matcha_count}
                />
                <MiniInfo
                  icon="🫘"
                  label="طلبات V60"
                  value={loyalty.v60_count}
                />
              </div>
            </div>

            {/* Achievements */}
            <div
              className="rounded-3xl p-5 shadow-xl border"
              style={{
                background: theme.cream,
                borderColor: "rgba(0,0,0,0.06)",
              }}
            >
              <h3 className="text-xl font-bold text-center mb-4">
                🏅 {settings.achievements_title || "إنجازاتك"}
              </h3>

              <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                {loyalty.achievements?.map((a) => (
                  <AchievementCard
                    key={a.code}
                    achievement={a}
                    accent={theme.accent}
                    card={theme.card}
                  />
                ))}
              </div>

              {loyalty.next_achievement && (
                <div
                  className="mt-4 rounded-2xl p-4"
                  style={{ background: `${theme.accent}18` }}
                >
                  <p className="text-sm font-bold">
                    إنجازك القادم: {loyalty.next_achievement.emoji}{" "}
                    {loyalty.next_achievement.name}
                  </p>
                  <p className="text-xs opacity-70 mt-1">
                    باقي {loyalty.next_achievement.remaining} لإكماله
                  </p>
                </div>
              )}
            </div>

            {/* CTA */}
            <a
              href={settings.order_button_url || "https://www.180-bh.com"}
              target="_blank"
              rel="noreferrer"
              className="block text-center rounded-full py-4 font-extrabold shadow-xl text-white"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, #B8872F)`,
              }}
            >
              {settings.order_button_text || "اطلب الآن واجمع زيارات أكثر ☕"}
            </a>

            <p className="text-center text-xs opacity-50 pb-4">
              www.180-bh.com
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function StatBox({ icon, value, label }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 text-center">
      <div className="text-2xl">{icon}</div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
      <div className="text-xs text-white/70 mt-1">{label}</div>
    </div>
  );
}

function MiniInfo({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
      <div className="text-2xl">{icon}</div>
      <p className="text-xs opacity-60 mt-2">{label}</p>
      <p className="text-sm font-bold mt-1">{value}</p>
    </div>
  );
}

function AchievementCard({ achievement, accent, card }) {
  const completed = achievement.completed;
  const percent =
    achievement.target_value > 0
      ? Math.min((achievement.progress / achievement.target_value) * 100, 100)
      : 0;

  return (
    <div
      className="min-w-[140px] snap-start rounded-2xl p-4 text-center border shadow-sm"
      style={{
        background: completed ? "#FFFFFF" : "#FAF6EF",
        borderColor: completed ? `${accent}55` : "#E5D8C8",
      }}
    >
      <div className="text-3xl mb-2">{achievement.emoji}</div>

      <h4 className="font-bold text-sm">{achievement.name}</h4>

      <p className="text-xs opacity-60 mt-1 leading-5">
        {achievement.description}
      </p>

      {completed ? (
        <div className="mt-3 text-green-600 text-xl">✅</div>
      ) : (
        <div className="mt-3">
          <div className="h-2 bg-black/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${percent}%`, background: card }}
            />
          </div>
          <p className="text-xs mt-2 font-bold">
            {achievement.progress} / {achievement.target_value}
          </p>
        </div>
      )}
    </div>
  );
}
