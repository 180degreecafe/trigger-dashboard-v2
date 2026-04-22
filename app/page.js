"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, phone")
        .limit(5);

      if (error) {
        console.error("ERROR:", error.message);
      } else {
        setData(data);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Connected to Supabase ✅</h1>

      {data.map((item) => (
        <p key={item.id}>{item.phone}</p>
      ))}
    </div>
  );
}
