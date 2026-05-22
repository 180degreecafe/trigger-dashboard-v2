"use client";

import { useState } from "react";

export default function RedeemRewardPage() {

  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);

  const [error, setError] = useState("");

  // =====================================================
  // REDEEM
  // =====================================================

  const handleRedeem = async () => {

    if (!coupon) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {

      const res = await fetch(
        "https://qwaooajgkkqtpbidzumd.supabase.co/functions/v1/redeem-reward",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            coupon_code: coupon
          }),
        }
      );

      const data = await res.json();

      if (data.success) {

        setResult(data);

      } else {

        setError(
          data.error || "فشل استخدام الكوبون"
        );

      }

    } catch {

      setError("حدث خطأ أثناء الاتصال بالخادم");

    }

    setLoading(false);
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      dir="rtl"
      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-gray-100
        px-4
      "
    >

      {/* Forced light mode */}
      <div className="
        bg-white
        text-gray-900
        dark:bg-white
        dark:text-gray-900
        shadow-lg
        rounded-2xl
        p-6
        max-w-md
        w-full
        text-center
        space-y-4
      ">

        {/* Title */}
        <h1 className="text-3xl font-bold">
          🎟️ Redeem Reward
        </h1>

        <p className="text-gray-500">
          أدخل كود الجائزة
        </p>

        {/* Input */}
        <input
          type="text"
          placeholder="180-4821"
          value={coupon}
          onChange={(e) =>
            setCoupon(e.target.value)
          }
          className="
            border
            border-gray-300
            p-4
            w-full
            rounded-xl
            text-center
            text-xl
            font-semibold
            tracking-wider
            text-gray-900
            bg-white
            focus:outline-none
            focus:ring-2
            focus:ring-black
          "
        />

        {/* Button */}
        <button
          onClick={handleRedeem}
          className="
            bg-black
            hover:bg-gray-800
            text-white
            py-3
            px-4
            rounded-xl
            w-full
            text-lg
            font-semibold
          "
        >
          {loading
            ? "جارٍ التحقق..."
            : "Redeem"}
        </button>

        {/* Success */}
        {result && (

          <div className="
            mt-4
            bg-green-50
            border
            border-green-200
            rounded-xl
            p-4
            space-y-2
          ">

            <div className="text-4xl">
              ✅
            </div>

            <p className="font-bold text-green-700 text-lg">
              تم استخدام الكوبون بنجاح
            </p>

            <p className="text-gray-700">
              🎁 {result.reward}
            </p>

            <p className="text-sm text-gray-500">
              {result.coupon_code}
            </p>

          </div>

        )}

        {/* Error */}
        {error && (

          <div className="
            mt-4
            bg-red-50
            border
            border-red-200
            rounded-xl
            p-4
          ">

            <div className="text-4xl mb-2">
              ❌
            </div>

            <p className="text-red-600 font-semibold">
              {error}
            </p>

          </div>

        )}

      </div>

    </div>
  );
}
`
