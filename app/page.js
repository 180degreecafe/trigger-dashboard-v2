"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabaseClient";

export default function Home() {
  const [data, setData] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .limit(5);

      if (error) {
        console.log("ERROR:", error);
      } else {
        setData(data);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Connected to Supabase ✅</h1>

      {data.map((item) => (
        <p key={item.id}>{item.phone}</p>
      ))}
    </div>
  );
}