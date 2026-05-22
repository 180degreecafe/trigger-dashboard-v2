"use client";

import { useState } from "react";

export default function RedeemRewardPage() {

  // =====================================================
  // STATES
  // =====================================================

  const [couponCode, setCouponCode] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [rewardData, setRewardData] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =====================================================
  // CHECK CODE
  // =====================================================

  const checkCode = async () => {

    console.log("🔍 CHECK CODE");

    console.log(couponCode);

    if (!couponCode.trim()) {

      setError("أدخل الكود");

      return;
    }

    try {

      setLoading(true);

      setError("");

      setSuccess("");

      setRewardData(null);

      const res = await fetch(
        "https://qwaooajgkkqtpbidzumd.supabase.co/functions/v1/redeem-reward",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            coupon_code: couponCode,
            action: "check",
          }),
        }
      );

      console.log(
        "📥 STATUS:",
        res.status
      );

      const rawText =
        await res.text();

      console.log(
        "📦 RAW RESPONSE:"
      );

      console.log(rawText);

      let data;

      try {

        data =
          JSON.parse(rawText);

      } catch (err) {

        console.log(err);

        setError("Invalid JSON");

        setLoading(false);

        return;
      }

      console.log(data);

      if (!res.ok) {

        setError(
          data.error ||
          "حدث خطأ"
        );

        setLoading(false);

        return;
      }

      setRewardData(data);

    } catch (err) {

      console.log(err);

      setError("Network Error");

    } finally {

      setLoading(false);
    }
  };

  // =====================================================
  // REDEEM
  // =====================================================

  const redeemCode = async () => {

    console.log("✅ REDEEM CODE");

    try {

      setLoading(true);

      setError("");

      setSuccess("");

      const res = await fetch(
        "https://qwaooajgkkqtpbidzumd.supabase.co/functions/v1/redeem-reward",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            coupon_code: couponCode,
            action: "redeem",
          }),
        }
      );

      console.log(
        "📥 STATUS:",
        res.status
      );

      const rawText =
        await res.text();

      console.log(
        "📦 RAW RESPONSE:"
      );

      console.log(rawText);

      let data;

      try {

        data =
          JSON.parse(rawText);

      } catch (err) {

        console.log(err);

        setError("Invalid JSON");

        setLoading(false);

        return;
      }

      console.log(data);

      if (!res.ok) {

        setError(
          data.error ||
          "حدث خطأ"
        );

        setLoading(false);

        return;
      }

      setSuccess(
        "✅ تم استخدام الكوبون بنجاح"
      );

      setRewardData({
        ...rewardData,
        redeemed: true,
      });

    } catch (err) {

      console.log(err);

      setError("Network Error");

    } finally {

      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      dir="rtl"
      className="
        min-h-screen
        bg-gray-100
        flex
        items-center
        justify-center
        px-4
      "
    >

      <div
        className="
          bg-white
          shadow-xl
          rounded-2xl
          p-6
          w-full
          max-w-md
        "
      >

        {/* TITLE */}

        <h1
          className="
            text-3xl
            font-bold
            text-center
            text-black
            mb-6
          "
        >
          🎟️ Redeem Reward
        </h1>

        {/* INPUT */}

        <input
          type="text"

          placeholder="أدخل الكود"

          value={couponCode}

          onChange={(e) =>
            setCouponCode(
              e.target.value
            )
          }

          className="
            border
            border-gray-300
            rounded-xl
            p-4
            w-full
            text-center
            text-2xl
            tracking-widest
            bg-white
            text-black
            placeholder:text-gray-400
          "
        />

        {/* BUTTON */}

        <button
          onClick={checkCode}

          disabled={loading}

          className="
            mt-4
            bg-black
            text-white
            rounded-xl
            p-4
            w-full
            font-bold
          "
        >
          {loading
            ? "جارٍ التحقق..."
            : "تحقق"}
        </button>

        {/* ERROR */}

        {error && (

          <div
            className="
              mt-4
              bg-red-100
              text-red-700
              p-3
              rounded-xl
              text-center
            "
          >
            {error}
          </div>

        )}

        {/* SUCCESS */}

        {success && (

          <div
            className="
              mt-4
              bg-green-100
              text-green-700
              p-3
              rounded-xl
              text-center
            "
          >
            {success}
          </div>

        )}

        {/* RESULT */}

        {rewardData && (

          <div
            className="
              mt-6
              border
              border-gray-200
              rounded-2xl
              p-5
              space-y-3
            "
          >

            <div className="text-center text-5xl">
              🎁
            </div>

            <h2
              className="
                text-2xl
                font-bold
                text-center
                text-black
              "
            >
              {rewardData.reward_name}
            </h2>

            <p className="text-black">
              📞 {rewardData.phone}
            </p>

            <p className="text-black">
              ⏳ ينتهي:
              {" "}
              {new Date(
                rewardData.expires_at
              ).toLocaleDateString()}
            </p>

            <p
              className={
                rewardData.redeemed
                  ? "text-red-600 font-bold"
                  : "text-green-600 font-bold"
              }
            >
              {rewardData.redeemed
                ? "❌ تم استخدامه"
                : "✅ صالح"}
            </p>

            {!rewardData.redeemed && (

              <button
                onClick={redeemCode}

                disabled={loading}

                className="
                  mt-4
                  bg-green-600
                  text-white
                  rounded-xl
                  p-4
                  w-full
                  font-bold
                "
              >
                استخدام الكوبون
              </button>

            )}

          </div>

        )}

      </div>

    </div>
  );
}
