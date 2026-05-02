"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Menu, X } from "lucide-react";

export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">

      {/* ---------- DESKTOP SIDEBAR ---------- */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* ---------- MOBILE ---------- */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">

          {/* Sidebar LEFT ✅ */}
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

      {/* ---------- MAIN ---------- */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">

          {/* Mobile Menu */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu size={18} />
          </button>

          <Header />
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>

      </div>
    </div>
  );
}
