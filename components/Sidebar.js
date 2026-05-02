"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  Megaphone,
  Bell,
  Activity,
} from "lucide-react";

const nav = [
  {
    label: "Overview",
    items: [{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Marketing",
    items: [
      { name: "Triggers", href: "/triggers", icon: Zap },
      { name: "Actions", href: "/actions", icon: Activity },
      { name: "Campaigns", href: "/campaigns", icon: Megaphone },
    ],
  },
  {
    label: "System",
    items: [{ name: "Notifications", href: "/notifications", icon: Bell }],
  },
];

export default function Sidebar({ onNavigate }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigate = (href) => {
    if (pathname === href) return; // ✅ يمنع re-render غير ضروري

    router.push(href);

    // ✅ إغلاق السايدبار في الموبايل
    if (onNavigate) onNavigate();
  };

  return (
    <div className="h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">

      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-gray-200 dark:border-gray-800 font-semibold text-gray-900 dark:text-white">
        180°
      </div>

      {/* Navigation */}
      <div className="p-3 space-y-6 overflow-y-auto">

        {nav.map((section) => (
          <div key={section.label}>

            {/* Section Label */}
            <div className="text-xs text-gray-400 mb-2 px-2 uppercase tracking-wide">
              {section.label}
            </div>

            {/* Items */}
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigate(item.href)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm
                      transition-all duration-150
                      ${
                        active
                          ? "bg-black text-white shadow-sm"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }
                    `}
                  >
                    <Icon size={18} />

                    <span className="truncate">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}
