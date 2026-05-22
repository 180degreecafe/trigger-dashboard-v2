"use client";

import { useEffect, useRef, useState } from "react";

const rewards = [
  "20% خصم",
  "30% خصم",
  "اشتر 1 واحصل 1",
  "20 نقطة اضافية",
  "بن قهوة من اختيارك",
  "شنطة V60",
  "جهاز اسبريسو",
  "حظاً أوفر",
];

export default function SpinWheelPage() {

  const canvasRef = useRef(null);

  const audioRef = useRef(null);

  const spinningRef = useRef(false);

  const [phone, setPhone] = useState("");

  const [rotation, setRotation] = useState(0);

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);

  // =====================================================
  // DRAW WHEEL
  // =====================================================

  const drawWheel = (rot = 0) => {

    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const size = canvas.width;

    const center = size / 2;

    const radius = 150;

    const slice = (2 * Math.PI) / rewards.length;

    ctx.clearRect(0, 0, size, size);

    ctx.save();

    ctx.translate(center, center);

    ctx.rotate(rot);

    rewards.forEach((reward, i) => {

      const start = i * slice;

      const end = start + slice;

      ctx.beginPath();

      ctx.moveTo(0, 0);

      ctx.arc(0, 0, radius, start, end);

      ctx.fillStyle = `hsl(${i * 45}, 85%, 60%)`;

      ctx.fill();

      ctx.save();

      ctx.rotate(start + slice / 2);

      ctx.translate(radius * 0.68, 0);

      ctx.rotate(Math.PI / 2);

      ctx.fillStyle = "#fff";

      ctx.font = "bold 15px Arial";

      ctx.textAlign = "center";

      ctx.fillText(reward, 0, 0);

      ctx.restore();

    });

    ctx.restore();

    // outer border

    ctx.beginPath();

    ctx.arc(center, center, radius, 0, Math.PI * 2);

    ctx.lineWidth = 8;

    ctx.strokeStyle = "#111";

    ctx.stroke();

    // pointer

    ctx.beginPath();

    ctx.moveTo(center - 16, 8);

    ctx.lineTo(center + 16, 8);

    ctx.lineTo(center, 42);

    ctx.fillStyle = "#111";

    ctx.fill();
  };

  // =====================================================
  // INIT
  // =====================================================

  useEffect(() => {

    drawWheel(rotation);

  }, [rotation]);

  // =====================================================
  // SPIN
  // =====================================================

  const handleSpin = async () => {

    if (!phone.trim()) {
      alert("أدخل رقم الجوال");
      return;
    }

    if (spinningRef.current) return;

    spinningRef.current = true;

    setLoading(true);

    setResult(null);

    audioRef.current?.play();

    try {

      // =========================================
      // 1. GET REWARD
      // =========================================

      const spinRes = await fetch(
        "https://qwaooajgkkqtpbidzumd.supabase.co/functions/v1/spin-wheel",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const spinData = await spinRes.json();

      if (!spinData.success) {

        alert("فشل في اختيار الجائزة");

        spinningRef.current = false;

        setLoading(false);

        return;
      }

      const reward = spinData.reward;

      // =========================================
      // 2. FIND SEGMENT
      // =========================================

      const index = rewards.findIndex(
        (r) => r === reward
      );

      if (index === -1) {

        alert("Reward mismatch");

        spinningRef.current = false;

        setLoading(false);

        return;
      }

      // =========================================
      // 3. SPIN ANIMATION
      // =========================================

      const sliceAngle =
        (2 * Math.PI) / rewards.length;

      const targetRotation =
        (Math.PI * 2 * 7) +
        ((Math.PI * 1.5) -
          (index * sliceAngle + sliceAngle / 2));

      const startRotation = rotation;

      const duration = 5500;

      const startTime = performance.now();

      function animate(now) {

        const elapsed = now - startTime;

        const progress = Math.min(
          elapsed / duration,
          1
        );

        // easeOutCubic

        const ease =
          1 - Math.pow(1 - progress, 3);

        const current =
          startRotation +
          (targetRotation - startRotation) * ease;

        setRotation(current);

        if (progress < 1) {

          requestAnimationFrame(animate);

        } else {

          finishClaim(reward);
        }
      }

      requestAnimationFrame(animate);

    } catch (err) {

      console.error(err);

      alert("Network Error");

      spinningRef.current = false;

      setLoading(false);
    }
  };

  // =====================================================
  // CLAIM REWARD
  // =====================================================

  const finishClaim = async (reward) => {

    try {

      const claimRes = await fetch(
        "https://qwaooajgkkqtpbidzumd.supabase.co/functions/v1/claim-reward",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            phone,
            reward,
          }),
        }
      );

      const claimData = await claimRes.json();

      if (!claimData.success) {

        alert(
          claimData.error || "Claim failed"
        );

      } else {

        setResult(claimData);
      }

    } catch (err) {

      console.error(err);

      alert("Claim Error");

    } finally {

      spinningRef.current = false;

      setLoading(false);

      audioRef.current?.pause();
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
        bg-gradient-to-b
        from-yellow-50
        to-orange-100
        flex
        flex-col
        items-center
        justify-center
        px-4
        py-10
      "
    >

      {/* audio */}

      <audio
        ref={audioRef}
        src="/spin-wheel.mp3"
        preload="auto"
      />

      {/* title */}

      <h1 className="
        text-4xl
        md:text-5xl
        font-black
        mb-8
      ">
        🎉 عجلة الحظ 🎉
      </h1>

      {/* wheel */}

      <div className="relative">

        <canvas
          ref={canvasRef}
          width={340}
          height={340}
          className="
            drop-shadow-2xl
          "
        />

        {/* center */}

        <button
          disabled={loading}
          onClick={handleSpin}
          className="
            absolute
            inset-0
            m-auto
            w-24
            h-24
            rounded-full
            bg-black
            text-white
            font-black
            text-xl
            shadow-xl
            hover:scale-105
            transition
          "
        >
          {loading ? "..." : "SPIN"}
        </button>

      </div>

      {/* phone */}

      <input
        type="tel"
        placeholder="رقم الجوال"
        value={phone}
        onChange={(e) =>
          setPhone(e.target.value)
        }
        className="
          mt-8
          border-2
          border-black/10
          rounded-2xl
          p-4
          text-center
          text-lg
          w-full
          max-w-sm
          bg-white
          shadow
          outline-none
        "
      />

      {/* result */}

      {result && (

        <div className="
          mt-8
          bg-white
          rounded-3xl
          shadow-xl
          p-6
          w-full
          max-w-md
          text-center
        ">

          <div className="text-6xl mb-4">
            🎁
          </div>

          <h2 className="
            text-3xl
            font-black
          ">
            {result.reward}
          </h2>

          <p className="
            mt-3
            text-gray-500
          ">
            تم إرسال الجائزة عبر الواتساب 📲
          </p>

          {result.coupon_code && (

            <div className="
              mt-5
              text-3xl
              font-mono
              font-black
              tracking-widest
            ">
              {result.coupon_code}
            </div>

          )}

        </div>

      )}

    </div>
  );
}
