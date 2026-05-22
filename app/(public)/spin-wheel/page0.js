"use client";

import { useEffect, useRef, useState } from "react";

export default function SpinWheelPage() {

  // =====================================================
  // STATES
  // =====================================================

  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);

  const [selectedReward, setSelectedReward] = useState(null);

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

    console.log("🎯 START SPIN");

    if (spinningRef.current) {

      console.log("⛔ Already spinning");

      return;
    }

    spinningRef.current = true;

    setLoading(true);

    setResult(null);

    setSelectedReward(null);

    try {

      console.log("📡 Calling spin-wheel function...");

      const spinRes = await fetch(
        "https://qwaooajgkkqtpbidzumd.supabase.co/functions/v1/spin-wheel",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("📥 Status:", spinRes.status);

      const rawText = await spinRes.text();

      console.log("📦 RAW RESPONSE:");
      console.log(rawText);

      let spinData;

      try {

        spinData = JSON.parse(rawText);

        console.log("✅ Parsed JSON:");
        console.log(spinData);

      } catch (jsonErr) {

        console.error("❌ JSON PARSE ERROR");
        console.error(jsonErr);

        alert("الدالة لم ترجع JSON صحيح");

        spinningRef.current = false;

        setLoading(false);

        return;
      }

      if (!spinRes.ok) {

        console.error("❌ HTTP ERROR");
        console.error(spinData);

        alert(spinData.error || "Server Error");

        spinningRef.current = false;

        setLoading(false);

        return;
      }

      if (!spinData.success) {

        console.error("❌ FUNCTION ERROR");
        console.error(spinData);

        alert(spinData.error || "Spin Failed");

        spinningRef.current = false;

        setLoading(false);

        return;
      }

      const reward = spinData.reward;

      console.log("🏆 Selected Reward:", reward);

      // ==========================================
      // FIND SEGMENT
      // ==========================================

      const prizeIndex =
        prizes.findIndex(
          (p) => p === reward
        );

      console.log("🎡 Prize Index:", prizeIndex);

      const anglePerPrize =
        (2 * Math.PI) / prizes.length;

      const stopAngle =
        (3 * Math.PI / 2) -
        (
          prizeIndex * anglePerPrize +
          anglePerPrize / 2
        );

      console.log("🛑 Stop Angle:", stopAngle);

      // ==========================================
      // ANIMATION
      // ==========================================

      let current = 0;

      let speed = 0.35;

      if (spinSoundRef.current) {

        console.log("🔊 Playing sound");

        spinSoundRef.current.currentTime = 0;

        spinSoundRef.current.play()
          .catch((e) => {
            console.error("🔇 Sound play error");
            console.error(e);
          });
      }

      const spin = setInterval(() => {

        current += speed;

        drawWheel(current);

        if (speed > 0.002) {

          speed *= 0.985;

        } else {

          clearInterval(spin);

          console.log("✅ Spin finished");

          drawWheel(stopAngle);

          if (spinSoundRef.current) {
            spinSoundRef.current.pause();
          }

          setSelectedReward(reward);

          spinningRef.current = false;

          setLoading(false);
        }

      }, 16);

    } catch (err) {

      console.error("🔥 NETWORK ERROR");
      console.error(err);

      alert("Network Error");

      spinningRef.current = false;

      setLoading(false);
    }
  };

  // =====================================================
  // SEND REWARD
  // =====================================================

  const sendReward = async () => {

    console.log("📲 SEND REWARD");

    if (!phone.trim()) {

      alert("أدخل رقم الجوال");

      return;
    }

    try {

      setLoading(true);

      console.log("📡 Calling claim-reward");

      const res = await fetch(
        "https://qwaooajgkkqtpbidzumd.supabase.co/functions/v1/claim-reward",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            phone,
            reward: selectedReward,
          }),
        }
      );

      console.log("📥 Claim Status:", res.status);

      const rawText = await res.text();

      console.log("📦 CLAIM RAW RESPONSE:");
      console.log(rawText);

      let data;

      try {

        data = JSON.parse(rawText);

      } catch (jsonErr) {

        console.error("❌ CLAIM JSON ERROR");
        console.error(jsonErr);

        alert("الدالة لم ترجع JSON");

        setLoading(false);

        return;
      }

      console.log("✅ CLAIM RESPONSE:");
      console.log(data);

      if (!res.ok) {

        console.error("❌ CLAIM HTTP ERROR");

        alert(data.error || "Claim Error");

        setLoading(false);

        return;
      }

      if (data.success) {

        setResult(data);

      } else {

        alert(data.error || "حدث خطأ");
      }

    } catch (err) {

      console.error("🔥 CLAIM NETWORK ERROR");
      console.error(err);

      alert("Network Error");

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

      {/* AUDIO */}

      <audio
        ref={spinSoundRef}
        src="/spin-wheel-sound.mp3"
        preload="auto"
      />

      {/* TITLE */}

      <h1 className="
        text-4xl
        font-bold
        mb-8
      ">
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
            shadow-xl
          "
        />

        {/* BUTTON */}

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
          {loading ? "..." : "SPIN"}
        </button>

      </div>

      {/* REWARD FORM */}

      {selectedReward && !result && (

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
            🎉
          </div>

          <h2 className="
            text-2xl
            font-bold
            mb-6
          ">
            {selectedReward}
          </h2>

          <input
            type="tel"
            placeholder="أدخل رقم الجوال"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            className="
              border
              border-gray-300
              rounded-xl
              p-4
              text-center
              text-lg
              w-full
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

      {/* FINAL RESULT */}

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
            ✅
          </div>

          <h2 className="
            text-2xl
            font-bold
          ">
            تم إرسال الجائزة
          </h2>

          <p className="
            mt-4
            text-lg
          ">
            🎁 {result.reward}
          </p>

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
            تم إرسال الرسالة عبر الواتساب 📲
          </p>

        </div>

      )}

    </div>
  );
}
