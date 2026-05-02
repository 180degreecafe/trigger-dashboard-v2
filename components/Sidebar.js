"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  Megaphone,
  Bell,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ---------- NAV ---------- */
const nav = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
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
    items: [
      { name: "Notifications", href: "/notifications", icon: Bell },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);

  /* ---------- load ---------- */
  useEffect(() => {
    const saved = localStorage.getItem("sidebar");
    if (saved) setCollapsed(saved === "true");
  }, []);

  /* ---------- save ---------- */
  useEffect(() => {
    localStorage.setItem("sidebar", collapsed);
  }, [collapsed]);

  const handleNavigate = (href) => {
    router.push(href);
  };

  return (
    /* 🔥 container ثابت */
    <div className="h-full w-64 relative">

      {/* 🔥 sidebar الفعلي */}
      <div
        className={`absolute top-0 left-0 h-full w-64
        bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-800
        transition-all duration-300`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 dark:border-gray-800">

          <span
            className={`font-semibold text-gray-900 dark:text-white transition-opacity ${
              collapsed ? "opacity-0" : "opacity-100"
            }`}
          >
            180°
          </span>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <div className="p-3 space-y-6 overflow-y-auto">

          {nav.map((section) => (
            <div key={section.label}>

              <div
                className={`text-xs text-gray-400 mb-2 px-2 transition-opacity ${
                  collapsed ? "opacity-0" : "opacity-100"
                }`}
              >
                {section.label}
              </div>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavigate(item.href)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition
                        ${
                          active
                            ? "bg-black text-white"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }
                      `}
                    >
                      <Icon size={18} />

                      {/* 🔥 نخفي النص بدون ما نكسر layout */}
                      <span
                        className={`transition-opacity ${
                          collapsed ? "opacity-0" : "opacity-100"
                        }`}
                      >
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

      {/* 🔥 overlay وهمي للمسافة لما collapsed */}
      {collapsed && (
        <div className="absolute top-0 left-0 h-full w-16 pointer-events-none" />
      )}

    </div>
  );
}
