"use client";

import { useState } from "react";

export default function CheckPointsPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  /* ---------- OTP ---------- */

  const handleSendOtp = async () => {
    if (!phone) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "https://qwaooajgkkqtpbidzumd.supabase.co/functions/v1/send-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        }
      );

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
      const res = await fetch(
        "https://qwaooajgkkqtpbidzumd.supabase.co/functions/v1/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, otp }),
        }
      );

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
      const res = await fetch(
        "https://qwaooajgkkqtpbidzumd.supabase.co/functions/v1/get-loyalty-points",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        }
      );

      const data = await res.json();
      setResult(data);
      setStep("result");
    } catch {
      setResult({ found: false });
    }
  };

  /* ---------- tier ---------- */

  const getTier = (spent) => {
    if (spent >= 40) return { name: "💎 بلاتيني", next: null };
    if (spent >= 20) return { name: "🟡 ذهبي", next: 40 };
    if (spent >= 10) return { name: "⚪️ فضي", next: 20 };
    return { name: "🟤 عادي", next: 10 };
  };

  const renderProgressBar = (spent) => {
    const tier = getTier(spent);
    const percent = tier.next
      ? Math.min((spent / tier.next) * 100, 100)
      : 100;

    return (
      <div className="mt-6 text-center">
        <p className="mb-2 font-medium">
          🌟 مستوى الولاء: {tier.name}
        </p>

        {tier.next && (
          <p className="text-sm text-gray-500">
            💡 تبقى لك{" "}
            {Math.max((tier.next - spent).toFixed(2), 0)} دينار للوصول إلى{" "}
            {getTier(tier.next).name}
          </p>
        )}

        <div className="w-full bg-gray-200 h-4 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-yellow-500 h-4 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  };

  /* ---------- UI ---------- */

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-yellow-50 px-4"
    >
      <div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full text-center space-y-4">

        <h1 className="text-2xl font-bold text-yellow-700">
          تحقق من نقاطك ⭐
        </h1>

        {/* STEP 1 */}
        {step === "phone" && (
          <>
            <p className="text-gray-600">📱 أدخل رقم جوالك</p>

            <input
              type="tel"
              placeholder="مثال: 66334455"
              className="border p-3 w-full rounded text-lg text-center"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <button
              onClick={handleSendOtp}
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded w-full"
            >
              {loading ? "جارٍ الإرسال..." : "إرسال كود التحقق"}
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === "otp" && (
          <>
            <p className="text-gray-600">
              🔒 أدخل كود التحقق المرسل على واتساب
            </p>

            <input
              type="text"
              placeholder="أدخل الكود هنا"
              className="border p-3 w-full rounded text-lg text-center tracking-widest"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button
              onClick={handleVerifyOtp}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded w-full"
            >
              {loading ? "جارٍ التحقق..." : "تحقق من الكود ✅"}
            </button>
          </>
        )}

        {/* STEP 3 */}
        {step === "result" && result && (
          <div className="mt-4 text-lg bg-gray-50 p-4 rounded space-y-2">

            {result.found ? (
              <>
                <p>
                  👤 <strong>الاسم:</strong> {result.name}
                </p>

                <p>
                  📞 <strong>رقم الجوال:</strong> {result.phone}
                </p>

                <p>
                  ⭐ <strong>نقاطك الحالية:</strong> {result.points}
                </p>

                {renderProgressBar(result.spent)}
              </>
            ) : (
              <p className="text-red-500">
                لم يتم العثور على عميل بهذا الرقم 😕
              </p>
            )}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
}
