"use client";

import { useEffect, useRef, useState } from "react";

export default function SpinWheelPage() {

  // =====================================================
  // STATES
  // =====================================================

  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);

  const [selectedReward, setSelectedReward] =
    useState(null);

  const [result, setResult] =
    useState(null);

  // =====================================================
  // REFS
  // =====================================================

  const canvasRef = useRef(null);

  const spinningRef = useRef(false);

  // =====================================================
  // VISUAL ONLY
  // =====================================================

  const prizes = [
    "🎁",
    "☕",
    "⭐",
    "🎉",
    "🔥",
    "💎",
    "🎯",
    "🥳",
  ];

  // =====================================================
  // SOUND
  // =====================================================

  const playSpinSound = () => {

    try {

      const audio =
        new Audio("/spin-wheel-sound.mp3");

      audio.volume = 0.5;

      audio.loop = true;

      audio.play().catch((err) => {

        console.log(
          "🔇 SOUND BLOCKED"
        );

        console.log(err);
      });

      console.log(
        "🔊 SOUND STARTED"
      );

      return audio;

    } catch (err) {

      console.log(
        "❌ AUDIO ERROR"
      );

      console.log(err);

      return null;
    }
  };

  // =====================================================
  // DRAW WHEEL
  // =====================================================

  const drawWheel = (
    rotation = 0
  ) => {

    const canvas =
      canvasRef.current;

    if (!canvas) return;

    const ctx =
      canvas.getContext("2d");

    const centerX =
      canvas.width / 2;

    const centerY =
      canvas.height / 2;

    const radius = 180;

    const angle =
      (2 * Math.PI)
      / prizes.length;

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.save();

    ctx.translate(
      centerX,
      centerY
    );

    ctx.rotate(rotation);

    for (
      let i = 0;
      i < prizes.length;
      i++
    ) {

      const start =
        i * angle;

      const end =
        start + angle;

      const color =
        `hsl(${i * 360 / prizes.length}, 75%, 60%)`;

      ctx.beginPath();

      ctx.fillStyle =
        color;

      ctx.moveTo(0, 0);

      ctx.arc(
        0,
        0,
        radius,
        start,
        end
      );

      ctx.fill();

      ctx.lineWidth = 3;

      ctx.strokeStyle =
        "#fff";

      ctx.stroke();

      // TEXT

      ctx.save();

      ctx.rotate(
        start + angle / 2
      );

      ctx.translate(
        radius * 0.68,
        0
      );

      ctx.rotate(
        Math.PI / 2
      );

      ctx.fillStyle =
        "#fff";

      ctx.font =
        "bold 30px Arial";

      ctx.textAlign =
        "center";

      ctx.fillText(
        prizes[i],
        0,
        0
      );

      ctx.restore();
    }

    ctx.restore();

    // POINTER

    ctx.beginPath();

    ctx.moveTo(
      centerX - 14,
      centerY - radius - 10
    );

    ctx.lineTo(
      centerX + 14,
      centerY - radius - 10
    );

    ctx.lineTo(
      centerX,
      centerY - radius + 18
    );

    ctx.fillStyle =
      "#ef4444";

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

    console.log(
      "🎯 START SPIN"
    );

    if (
      spinningRef.current
    ) {
      return;
    }

    spinningRef.current = true;

    setLoading(true);

    setResult(null);

    setSelectedReward(null);

    // ==========================================
    // SOUND
    // ==========================================

    const sound =
      playSpinSound();

    try {

      // ==========================================
      // VISUAL ONLY
      // ==========================================

      const visualIndex =
        Math.floor(
          Math.random()
          * prizes.length
        );

      console.log(
        "🎡 VISUAL INDEX:",
        visualIndex
      );

      // ==========================================
      // BACKEND
      // ==========================================

      console.log(
        "📡 CALLING SPIN-WHEEL..."
      );

      const spinRes =
        await fetch(
          "https://qwaooajgkkqtpbidzumd.supabase.co/functions/v1/spin-wheel",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );

      console.log(
        "📥 STATUS:",
        spinRes.status
      );

      const rawText =
        await spinRes.text();

      console.log(
        "📦 RAW RESPONSE:"
      );

      console.log(rawText);

      const spinData =
        JSON.parse(rawText);

      console.log(
        "✅ PARSED:"
      );

      console.log(spinData);

      if (!spinRes.ok) {

        alert(
          spinData.error ||
          "Spin Error"
        );

        setLoading(false);

        spinningRef.current = false;

        if (sound) {
          sound.pause();
        }

        return;
      }

      // ==========================================
      // REAL REWARD
      // ==========================================

      setSelectedReward({

        id:
          spinData.reward_id,

        name:
          spinData.reward_name,
      });

      console.log(
        "🏆 REWARD:"
      );

      console.log(
        spinData.reward_name
      );

      // ==========================================
      // ANGLES
      // ==========================================

      const anglePerPrize =
        (2 * Math.PI)
        / prizes.length;

      const fullSpins = 6;

      const targetAngle =
        (
          (2 * Math.PI)
          -
          (
            visualIndex * anglePerPrize
            + anglePerPrize / 2
          )
        );

      const stopAngle =
        (
          fullSpins
          * 2
          * Math.PI
        )
        + targetAngle;

      console.log(
        "🛑 STOP ANGLE:"
      );

      console.log(
        stopAngle
      );

      // ==========================================
      // ANIMATION
      // ==========================================

      const duration = 5000;

      const start =
        performance.now();

      const animate =
        (time) => {

        const elapsed =
          time - start;

        const progress =
          Math.min(
            elapsed / duration,
            1
          );

        const eased =
          1 -
          Math.pow(
            1 - progress,
            4
          );

        const rotation =
          stopAngle * eased;

        drawWheel(
          rotation
        );

        if (
          progress < 1
        ) {

          requestAnimationFrame(
            animate
          );

        } else {

          console.log(
            "✅ FINISHED"
          );

          if (sound) {
            sound.pause();
          }

          spinningRef.current = false;

          setLoading(false);
        }
      };

      requestAnimationFrame(
        animate
      );

    } catch (err) {

      console.log(
        "🔥 NETWORK ERROR"
      );

      console.log(err);

      if (sound) {
        sound.pause();
      }

      alert(
        "Network Error"
      );

      spinningRef.current = false;

      setLoading(false);
    }
  };

  // =====================================================
  // SEND REWARD
  // =====================================================

  const sendReward = async () => {

    console.log(
      "📲 SEND REWARD"
    );

    console.log(
      selectedReward
    );

    if (!phone.trim()) {

      alert(
        "أدخل رقم الجوال"
      );

      return;
    }

    if (!selectedReward) {

      alert(
        "لا توجد جائزة"
      );

      return;
    }

    try {

      setLoading(true);

      const res =
        await fetch(
          "https://qwaooajgkkqtpbidzumd.supabase.co/functions/v1/claim-reward",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({

                phone,

                reward_id:
                  selectedReward.id,

                reward_name:
                  selectedReward.name,
              }),
          }
        );

      console.log(
        "📥 CLAIM STATUS:"
      );

      console.log(
        res.status
      );

      const rawText =
        await res.text();

      console.log(
        "📦 CLAIM RAW:"
      );

      console.log(
        rawText
      );

      const data =
        JSON.parse(
          rawText
        );

      console.log(
        "✅ CLAIM:"
      );

      console.log(
        data
      );

      if (!res.ok) {

        alert(
          data.error ||
          "Claim Error"
        );

        setLoading(false);

        return;
      }

      setResult(data);

    } catch (err) {

      console.log(
        "🔥 CLAIM ERROR"
      );

      console.log(err);

      alert(
        "Network Error"
      );

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
        flex-col
        items-center
        justify-center
        px-4
        py-10
      "
    >

      <h1
        className="
          text-4xl
          font-bold
          text-black
          mb-8
        "
      >
        🎉 عجلة الحظ 🎉
      </h1>

      {/* WHEEL */}

      <div className="relative">

        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="
            bg-white
            rounded-full
            shadow-2xl
          "
        />

        <button
          onClick={startSpin}

          disabled={loading}

          className="
            absolute
            top-1/2
            left-1/2
            -translate-x-1/2
            -translate-y-1/2
            w-24
            h-24
            rounded-full
            bg-black
            text-white
            font-bold
            text-xl
            shadow-xl
          "
        >
          {loading
            ? "..."
            : "SPIN"}
        </button>

      </div>

      {/* CLAIM */}

      {selectedReward && !result && (

        <div
          className="
            mt-8
            bg-white
            p-6
            rounded-2xl
            shadow-xl
            w-full
            max-w-md
            text-center
          "
        >

          <div className="text-6xl">
            🎁
          </div>

          <h2
            className="
              text-2xl
              font-bold
              text-black
              mt-4
            "
          >
            {selectedReward.name}
          </h2>

          <input
            type="tel"

            placeholder="أدخل رقم الجوال"

            value={phone}

            onChange={(e) =>
              setPhone(
                e.target.value
              )
            }

            className="
              mt-6
              border
              border-gray-300
              rounded-xl
              p-4
              w-full
              text-center
              text-black
              bg-white
            "
          />

          <button
            onClick={sendReward}

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
              ? "جارٍ الإرسال..."
              : "إرسال الجائزة"}
          </button>

        </div>

      )}

      {/* RESULT */}

      {result && (

        <div
          className="
            mt-8
            bg-white
            p-6
            rounded-2xl
            shadow-xl
            text-center
            max-w-md
            w-full
          "
        >

          <div className="text-6xl">
            ✅
          </div>

          <h2
            className="
              text-2xl
              font-bold
              text-black
              mt-4
            "
          >
            تم إرسال الجائزة
          </h2>

          <p
            className="
              mt-4
              text-black
              text-lg
            "
          >
            🎁 {result.reward}
          </p>

          <div
            className="
              mt-4
              text-5xl
              font-bold
              text-black
            "
          >
            {result.coupon_code}
          </div>

        </div>

      )}

    </div>
  );
}
