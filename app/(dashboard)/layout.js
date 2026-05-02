"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">

      {/* ✅ Desktop Sidebar (ثابت) */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* ✅ Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">

          {/* Sidebar (LEFT) */}
          <div className="w-64 h-full bg-white dark:bg-gray-900 shadow-xl">
            <Sidebar />
          </div>

          {/* Overlay */}
          <div
            className="flex-1 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* ✅ Main */}
      <div className="flex-1 flex flex-col min-w-0">

        <Header onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>

      </div>
    </div>
  );
}
