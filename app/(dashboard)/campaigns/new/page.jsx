"use client";

import { useEffect, useState } from "react";

import { createClient } from "@supabase/supabase-js";

// =====================================================
// SUPABASE
// =====================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// =====================================================
// CONSTANTS
// =====================================================

const campaignTypes = [
  "Discount",
  "Gift",
  "Points",
];

const targetAudiences = [
  "All customers",
  "new",
  "churned",
  "inactive",
  "first_order",
  "high_spender",
  "favorite_drink",
  "no_favorite_yet",
  "frequent_buyer",
  "inactive_after_first",
];

// =====================================================
// PAGE
// =====================================================

export default function NewCampaignPage() {

  // =====================================================
  // STATES
  // =====================================================

  const [formError, setFormError] =
    useState("");

  const [sending, setSending] =
    useState(false);

  const [targetCount, setTargetCount] =
    useState(0);

  const [form, setForm] = useState({

    id: null,

    name: "",

    description: "",

    type: "",

    audience: [],

    message: "",

    schedule: "",

    sendNow: true,

    saveAsDraft: false,

    channels: [],
  });

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleInputChange = (e) => {

    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  // =====================================================
  // AUDIENCE TOGGLE
  // =====================================================

  const handleAudienceToggle =
    (aud) => {

    setForm((prev) => ({

      ...prev,

      audience:
        prev.audience.includes(aud)

          ? prev.audience.filter(
              (a) => a !== aud
            )

          : [
              ...prev.audience,
              aud,
            ],
    }));
  };

  // =====================================================
  // CHANNEL TOGGLE
  // =====================================================

  const handleChannelToggle =
    (channel) => {

    setForm((prev) => ({

      ...prev,

      channels:
        prev.channels.includes(channel)

          ? prev.channels.filter(
              (c) => c !== channel
            )

          : [
              ...prev.channels,
              channel,
            ],
    }));
  };

  // =====================================================
  // TARGET COUNT
  // =====================================================

  const getTargetCount =
    async (audience) => {

    if (
      !audience ||
      audience.length === 0
    ) {
      return 0;
    }

    // NEW CUSTOMERS

    if (
      audience.includes("new")
    ) {

      const { data } =
        await supabase.rpc(
          "count_new_customers"
        );

      return data || 0;
    }

    // ALL CUSTOMERS

    if (
      audience.includes(
        "All customers"
      )
    ) {

      const { data } =
        await supabase.rpc(
          "count_latest_triggers_all"
        );

      return data || 0;
    }

    // NORMAL

    const { data } =
      await supabase.rpc(
        "count_latest_triggers_by_type",
        {
          target_types:
            audience,
        }
      );

    return data || 0;
  };

  // =====================================================
  // UPDATE TARGET COUNT
  // =====================================================

  useEffect(() => {

    const updateCount =
      async () => {

      const count =
        await getTargetCount(
          form.audience
        );

      setTargetCount(count);
    };

    updateCount();

  }, [form.audience]);

  // =====================================================
  // CREATE CAMPAIGN
  // =====================================================

  const handleCreateCampaign =
    async () => {

    setFormError("");

    // VALIDATION

    if (
      !form.name ||
      !form.description ||
      !form.type ||
      form.channels.length === 0 ||
      form.audience.length === 0 ||
      !form.message
    ) {

      setFormError(
        "يرجى تعبئة جميع الحقول المطلوبة."
      );

      return null;
    }

    if (
      !form.sendNow &&
      !form.schedule
    ) {

      setFormError(
        "يرجى تحديد تاريخ الجدولة."
      );

      return null;
    }

    // STATUS

    const status =
      form.saveAsDraft
        ? "Draft"
        : "Active";

    const channel =
      form.channels.length === 1
        ? form.channels[0]
        : "Multiple";

    // PAYLOAD

    const newCampaign = {

      name:
        form.name,

      description:
        form.description,

      type:
        form.type,

      audience:
        form.audience,

      message:
        form.message,

      schedule:
        form.sendNow
          ? null
          : form.schedule,

      send_now:
        form.sendNow,

      save_as_draft:
        form.saveAsDraft,

      channels:
        form.channels,

      channel,

      status,
    };

    console.log(
      "📤 INSERT CAMPAIGN:"
    );

    console.log(newCampaign);

    // INSERT

    const {
      data,
      error,
    } = await supabase
      .from("campaigns")
      .insert(newCampaign)
      .select()
      .single();

    if (error) {

      console.error(error);

      setFormError(
        error.message
      );

      return null;
    }

    return data;
  };

  // =====================================================
  // SEND CAMPAIGN
  // =====================================================

  const handleSendCampaign =
    async (campaignId) => {

    console.log(
      "🚀 SEND CAMPAIGN"
    );

    setSending(true);

    try {

      const response =
        await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/prepare-campaign-jobs`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },

            body:
              JSON.stringify({

                campaign_id:
                  campaignId,

                audience:
                  [...form.audience],
              }),
          }
        );

      const result =
        await response.json();

      console.log(result);

      if (!response.ok) {

        alert(
          result.error ||
          "Send Error"
        );

        setSending(false);

        return;
      }

      alert(
        `✅ تم إنشاء ${result.job_count} مهمة`
      );

      window.location.href =
        "/campaigns";

    } catch (err) {

      console.error(err);

      alert(
        "حدث خطأ غير متوقع"
      );

    } finally {

      setSending(false);
    }
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit =
    async () => {

    try {

      const created =
        await handleCreateCampaign();

      if (!created?.id) {
        return;
      }

      // DRAFT

      if (
        form.saveAsDraft
      ) {

        alert(
          "✅ تم حفظ الحملة"
        );

        window.location.href =
          "/campaigns";

        return;
      }

      // SEND NOW

      if (
        form.sendNow
      ) {

        await handleSendCampaign(
          created.id
        );

        return;
      }

      // SCHEDULE

      alert(
        "✅ تم جدولة الحملة"
      );

      window.location.href =
        "/campaigns";

    } catch (err) {

      console.error(err);

      setFormError(
        "حدث خطأ أثناء العملية"
      );
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      dir="ltr"
      className="
        min-h-screen
        bg-gray-50
        dark:bg-gray-900
        p-6
      "
    >

      <div
        className="
          max-w-3xl
          mx-auto
          bg-white
          dark:bg-gray-800
          rounded-xl
          shadow-lg
          p-6
        "
      >

        {/* TITLE */}

        <h1
          className="
            text-3xl
            font-bold
            mb-6
          "
        >
          📢 Create Campaign
        </h1>

        {/* ERROR */}

        {formError && (

          <div
            className="
              mb-4
              bg-red-100
              text-red-700
              border
              border-red-300
              rounded-lg
              p-3
            "
          >
            {formError}
          </div>
        )}

        {/* NAME */}

        <input
          type="text"

          name="name"

          placeholder="Campaign Name"

          value={form.name}

          onChange={
            handleInputChange
          }

          className="
            w-full
            border
            rounded-lg
            p-3
            mb-4
            bg-white
            dark:bg-gray-900
          "
        />

        {/* DESCRIPTION */}

        <textarea
          name="description"

          placeholder="Campaign Description"

          value={form.description}

          onChange={
            handleInputChange
          }

          className="
            w-full
            border
            rounded-lg
            p-3
            mb-4
            bg-white
            dark:bg-gray-900
          "
        />

        {/* TYPE */}

        <select
          name="type"

          value={form.type}

          onChange={
            handleInputChange
          }

          className="
            w-full
            border
            rounded-lg
            p-3
            mb-4
            bg-white
            dark:bg-gray-900
          "
        >

          <option value="">
            Select Campaign Type
          </option>

          {campaignTypes.map(
            (type) => (

            <option
              key={type}
              value={type}
            >
              {type}
            </option>
          ))}
        </select>

        {/* CHANNELS */}

        <div className="mb-4">

          <div className="font-semibold mb-2">
            Send by:
          </div>

          <div className="flex gap-4">

            {["WhatsApp", "Email"].map(
              (channel) => (

              <label
                key={channel}
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <input
                  type="checkbox"

                  checked={form.channels.includes(
                    channel
                  )}

                  onChange={() =>
                    handleChannelToggle(
                      channel
                    )
                  }
                />

                {channel}

              </label>
            ))}
          </div>
        </div>

        {/* AUDIENCE */}

        <div className="mb-4">

          <div className="font-semibold mb-2">
            Audience
          </div>

          <div className="flex flex-wrap gap-2">

            {targetAudiences.map(
              (aud) => (

              <button
                key={aud}

                type="button"

                onClick={() =>
                  handleAudienceToggle(
                    aud
                  )
                }

                className={`
                  px-3
                  py-1
                  rounded-full
                  border
                  text-sm
                  ${
                    form.audience.includes(aud)

                    ? "bg-blue-600 text-white"

                    : "bg-white text-gray-700"
                  }
                `}
              >
                {aud.replaceAll(
                  "_",
                  " "
                )}
              </button>
            ))}
          </div>

          <div
            className="
              text-sm
              text-gray-500
              mt-2
            "
          >
            🎯 Target:
            {" "}
            {targetCount}
            {" "}
            customers
          </div>
        </div>

        {/* MESSAGE */}

        <textarea
          name="message"

          placeholder="Message Content"

          value={form.message}

          onChange={
            handleInputChange
          }

          className="
            w-full
            border
            rounded-lg
            p-3
            mb-4
            min-h-[150px]
            bg-white
            dark:bg-gray-900
          "
        />

        {/* SEND OPTIONS */}

        <div className="mb-4">

          <div className="flex gap-6">

            <label
              className="
                flex
                items-center
                gap-2
              "
            >

              <input
                type="radio"

                checked={form.sendNow}

                onChange={() =>
                  setForm({
                    ...form,
                    sendNow: true,
                  })
                }
              />

              Send now

            </label>

            <label
              className="
                flex
                items-center
                gap-2
              "
            >

              <input
                type="radio"

                checked={!form.sendNow}

                onChange={() =>
                  setForm({
                    ...form,
                    sendNow: false,
                  })
                }
              />

              Schedule later

            </label>
          </div>
        </div>

        {/* SCHEDULE */}

        {!form.sendNow && (

          <input
            type="datetime-local"

            name="schedule"

            value={form.schedule}

            onChange={
              handleInputChange
            }

            className="
              w-full
              border
              rounded-lg
              p-3
              mb-4
              bg-white
              dark:bg-gray-900
            "
          />
        )}

        {/* DRAFT */}

        <label
          className="
            flex
            items-center
            gap-2
            mb-6
          "
        >

          <input
            type="checkbox"

            checked={
              form.saveAsDraft
            }

            onChange={(e) =>
              setForm({
                ...form,
                saveAsDraft:
                  e.target.checked,
              })
            }
          />

          Save as Draft

        </label>

        {/* ACTIONS */}

        <div
          className="
            flex
            justify-end
            gap-3
          "
        >

          <button
            onClick={() =>
              window.location.href =
                "/campaigns"
            }

            className="
              px-5
              py-2
              rounded-lg
              bg-gray-300
              hover:bg-gray-400
            "
          >
            Cancel
          </button>

          <button
            onClick={
              handleSubmit
            }

            disabled={sending}

            className="
              px-5
              py-2
              rounded-lg
              bg-blue-600
              hover:bg-blue-700
              text-white
            "
          >
            {sending

              ? "Sending..."

              : form.saveAsDraft

              ? "Save"

              : form.sendNow

              ? "Send"

              : "Schedule"}
          </button>

        </div>

      </div>
    </div>
  );
}
