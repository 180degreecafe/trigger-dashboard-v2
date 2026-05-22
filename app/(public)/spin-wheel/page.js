"use client";

import { useEffect, useRef, useState } from "react";

export default function SpinWheelPage() {

  // =====================================================
  // STATES
  // =====================================================

  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);

  // =====================================================
  // REFS
  // =====================================================

  const canvasRef = useRef(null);

  const spinSoundRef = useRef(null);

  const spinningRef = useRef(false);

  // =====================================================
  // PRIZES
  // =====================================================

  const prizes = [
    "حظاً أوفر",
    "20% خصم",
    "30% خصم",
    "اشتر 1 واحصل 1 مجان",
    "20 نقطة اضافية",
    "بن قهوة من اختيارك",
    "شنطة V60",
    "جهاز اسبريسو",
  ];

  // =====================================================
  // DRAW WHEEL
  // =====================================================

  const drawWheel = (rotation = 0) => {

    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const centerX = canvas.width / 2;

    const centerY = canvas.height / 2;

    const radius = 180;

    const angle = (2 * Math.PI) / prizes.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    ctx.translate(centerX, centerY);

    ctx.rotate(rotation);

    for (let i = 0; i < prizes.length; i++) {

      const start = i * angle;

      const end = start + angle;

      const color =
        `hsl(${i * 360 / prizes.length}, 70%, 60%)`;

      ctx.beginPath();

      ctx.fillStyle = color;

      ctx.moveTo(0, 0);

      ctx.arc(0, 0, radius, start, end);

      ctx.fill();

      // text

      ctx.save();

      ctx.rotate(start + angle / 2);

      ctx.translate(radius * 0.65, 0);

      ctx.rotate(Math.PI / 2);

      ctx.fillStyle = "#fff";

      ctx.font = "bold 14px Arial";

      ctx.textAlign = "center";

      ctx.fillText(prizes[i], 0, 0);

      ctx.restore();
    }

    ctx.restore();

    // pointer

    ctx.beginPath();

    ctx.moveTo(centerX - 12, centerY - radius - 10);

    ctx.lineTo(centerX + 12, centerY - radius - 10);

    ctx.lineTo(centerX, centerY - radius + 15);

    ctx.fillStyle = "#ef4444";

    ctx.fill();
  };

  // =====================================================
  // INIT
  // =====================================================

  useEffect(() => {

    drawWheel();

  }, []);

  // =====================================================
  // START SPIN
  // =====================================================

  const startSpin = async () => {

    if (spinningRef.current) return;

    if (!phone.trim()) {

      alert("أدخل رقم الجوال");

      return;
    }

    spinningRef.current = true;

    setLoading(true);

    setResult(null);

    try {

      // ==========================================
      // 1. GET REWARD
      // ==========================================

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

      // ==========================================
      // 2. DETERMINE STOP ANGLE
      // ==========================================

      const prizeIndex =
        prizes.findIndex(
          (p) => p === reward
        );

      const anglePerPrize =
        (2 * Math.PI) / prizes.length;

      const stopAngle =
        (3 * Math.PI / 2) -
        (
          prizeIndex * anglePerPrize +
          anglePerPrize / 2
        );

      // ==========================================
      // 3. START ANIMATION
      // ==========================================

      let current = 0;

      let speed = 0.35;

      spinSoundRef.current.currentTime = 0;

      spinSoundRef.current.play();

      const spin = setInterval(() => {

        current += speed;

        drawWheel(current);

        if (speed > 0.002) {

          speed *= 0.985;

        } else {

          clearInterval(spin);

          drawWheel(stopAngle);

          spinSoundRef.current.pause();

          finishClaim(reward);
        }

      }, 16);

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

      const res = await fetch(
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

      const data = await res.json();

      if (data.success) {

        setResult(data);

      } else {

        alert(data.error || "Claim failed");
      }

    } catch (err) {

      console.error(err);

      alert("حدث خطأ");

    } finally {

      spinningRef.current = false;

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
        flex-col
        items-center
        justify-center
        px-4
        py-10
      "
    >

      <audio
        ref={spinSoundRef}
        src="/spin-wheel-sound.mp3"
        preload="auto"
      />

      <h1 className="
        text-4xl
        font-bold
        mb-8
      ">
        🎉 عجلة الحظ 🎉
      </h1>

      {/* wheel */}

      <div className="relative">

        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="
            bg-white
            rounded-full
            shadow-xl
          "
        />

        {/* center button */}

        <button
          onClick={startSpin}
          disabled={loading}
          className="
            absolute
            top-1/2
            left-1/2
            -translate-x-1/2
            -translate-y-1/2
            bg-black
            text-white
            rounded-full
            w-20
            h-20
            font-bold
            text-xl
            shadow-lg
          "
        >
          {loading ? "..." : "180"}
        </button>

      </div>

      {/* phone */}

      <input
        type="tel"
        placeholder="أدخل رقم الجوال"
        value={phone}
        onChange={(e) =>
          setPhone(e.target.value)
        }
        className="
          mt-8
          border
          border-gray-300
          rounded-xl
          p-4
          text-center
          text-lg
          w-full
          max-w-sm
          bg-white
        "
      />

      {/* result */}

      {result && (

        <div className="
          mt-8
          bg-white
          p-6
          rounded-2xl
          shadow-lg
          text-center
          max-w-md
          w-full
        ">

          <div className="text-5xl mb-3">
            🎁
          </div>

          <h2 className="
            text-2xl
            font-bold
          ">
            {result.reward}
          </h2>

          {result.coupon_code && (

            <div className="
              mt-4
              text-3xl
              font-mono
              font-bold
            ">
              {result.coupon_code}
            </div>

          )}

          <p className="
            mt-4
            text-gray-500
          ">
            تم إرسال الجائزة عبر الواتساب 📲
          </p>

        </div>

      )}

    </div>
  );
}
