"use client";

import { useState } from "react";

/* ---------- helpers ---------- */

const getTier = (spent) => {
  if (spent >= 40) return { name: "💎 Platinum", next: null };
  if (spent >= 20) return { name: "🟡 Gold", next: 40 };
  if (spent >= 10) return { name: "⚪️ Silver", next: 20 };
  return { name: "🟤 Basic", next: 10 };
};

/* ---------- page ---------- */

export default function PointsPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  /* ---------- actions ---------- */

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
        setError("Failed to send OTP");
      }
    } catch {
      setError("Network error");
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
        setError("Invalid code");
      }
    } catch {
      setError("Verification failed");
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

  /* ---------- UI ---------- */

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* Logo / Brand */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            180° Loyalty
          </h1>
          <p className="text-sm text-gray-500">
            Check your points instantly
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">

          {/* STEP 1 */}
          {step === "phone" && (
            <>
              <div>
                <label className="text-sm text-gray-600">
                  Phone number
                </label>

                <input
                  type="tel"
                  placeholder="66334455"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input mt-2 text-center text-lg tracking-wide"
                />
              </div>

              <button
                onClick={handleSendOtp}
                className="btn-primary w-full"
              >
                {loading ? "Sending..." : "Send code"}
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === "otp" && (
            <>
              <div>
                <label className="text-sm text-gray-600">
                  Verification code
                </label>

                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input mt-2 text-center text-xl tracking-widest"
                  placeholder="••••"
                />
              </div>

              <button
                onClick={handleVerifyOtp}
                className="btn-primary w-full"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>

              <button
                onClick={() => setStep("phone")}
                className="text-sm text-gray-500 hover:text-black"
              >
                Change number
              </button>
            </>
          )}

          {/* STEP 3 */}
          {step === "result" && result && (
            <ResultCard result={result} />
          )}

          {/* Error */}
          {error && (
            <div className="text-sm text-red-600 text-center">
              {error}
            </div>
          )}

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Powered by 180°
        </p>
      </div>
    </div>
  );
}

/* ---------- result ---------- */

function ResultCard({ result }) {
  if (!result.found) {
    return (
      <div className="text-center text-red-500">
        Customer not found
      </div>
    );
  }

  const tier = getTier(result.spent);
  const percent = tier.next
    ? Math.min((result.spent / tier.next) * 100, 100)
    : 100;

  return (
    <div className="space-y-4 text-center">

      <div>
        <p className="text-sm text-gray-500">{result.name}</p>
        <p className="text-xs text-gray-400">{result.phone}</p>
      </div>

      <div>
        <p className="text-3xl font-bold">
          {result.points}
        </p>
        <p className="text-sm text-gray-500">points</p>
      </div>

      {/* Tier */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="font-medium">{tier.name}</p>

        {tier.next && (
          <p className="text-xs text-gray-500 mt-1">
            {Math.max((tier.next - result.spent).toFixed(2), 0)} left
            to next level
          </p>
        )}

        {/* Progress */}
        <div className="w-full bg-gray-200 h-2 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-yellow-500 h-2 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="btn-secondary w-full"
      >
        Check another number
      </button>
    </div>
  );
}
