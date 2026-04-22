import { supabase } from "@/lib/supabaseClient";

export async function getTriggers() {
  // جلب التريجرز اللي تم التعامل معها
  const { data: actions } = await supabase
    .from("trigger_actions")
    .select("trigger_id");

  const actedIds = actions?.map(a => a.trigger_id) || [];

  // جلب التريجرز
  const { data, error } = await supabase
    .from("triggers")
    .select(`
      id,
      type,
      message,
      recommendation,
      created_at,
      refreshed_at,
      customers(phone)
    `)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) throw error;

  // فلترة
  return data.filter(t => !actedIds.includes(t.id));
}

export async function actOnTrigger(trigger, actionType) {
  if (actionType === "send") {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-offer`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trigger_id: trigger.id }),
      }
    );

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error("Send failed");
    }
  }

  const { error } = await supabase.from("trigger_actions").insert({
    trigger_id: trigger.id,
    trigger_type: trigger.type,
    action: actionType,
    acted_at: new Date().toISOString(),
    admin_name: "admin",
  });

  if (error) throw error;
}
