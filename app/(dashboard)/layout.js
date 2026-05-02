"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">

      {/* ---------- Desktop Sidebar ---------- */}
      <div className="hidden md:block w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* ---------- Mobile Drawer ---------- */}
      <div
        className={`
          fixed inset-0 z-50 md:hidden
          ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}
        `}
      >
        {/* Overlay */}
        <div
          onClick={() => setMobileOpen(false)}
          className={`
            absolute inset-0 bg-black/40 transition-opacity duration-300
            ${mobileOpen ? "opacity-100" : "opacity-0"}
          `}
        />

        {/* Sidebar */}
        <div
          className={`
            absolute left-0 top-0 h-full w-64
            bg-white dark:bg-gray-900 shadow-xl
            transform transition-transform duration-300
            ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>

      {/* ---------- Main ---------- */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <Header onMenuClick={() => setMobileOpen(true)} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto">

          {/* 🔥 هذا هو الحل الحقيقي */}
          <div className="px-4 md:px-6 py-4">
            {children}
          </div>

        </main>

      </div>
    </div>
  );
}
