"use client";

import { Menu } from "lucide-react";

export default function Header({ onMenuClick }) {
  return (
    <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">

      {/* ✅ ONE BUTTON ONLY */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Menu size={18} />
      </button>

      <div className="font-medium text-gray-900 dark:text-white">
        Dashboard
      </div>

      <div />
    </div>
  );
}
