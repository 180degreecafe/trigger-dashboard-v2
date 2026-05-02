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
  Menu,
  X,
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
  const [mobileOpen, setMobileOpen] = useState(false);

  /* ---------- LOAD SIDEBAR STATE ---------- */
  useEffect(() => {
    const saved = localStorage.getItem("sidebar");
    if (saved) setCollapsed(saved === "true");
  }, []);

  /* ---------- SAVE SIDEBAR STATE ---------- */
  useEffect(() => {
    localStorage.setItem("sidebar", collapsed);
  }, [collapsed]);

  /* ---------- CLOSE MOBILE ON NAV ---------- */
  const handleNavigate = (href) => {
    router.push(href);
    setMobileOpen(false);
  };

  /* ---------- SIDEBAR CONTENT ---------- */
  const SidebarContent = (
    <div
      className={`h-full flex flex-col
      bg-white dark:bg-gray-900 
      border-r border-gray-200 dark:border-gray-800
      ${collapsed ? "w-16" : "w-64"} 
      transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 dark:border-gray-800">

        {!collapsed && (
          <span className="font-semibold text-gray-900 dark:text-white">
            180°
          </span>
        )}

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

            {!collapsed && (
              <div className="text-xs text-gray-400 mb-2 px-2">
                {section.label}
              </div>
            )}

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
                    {!collapsed && <span>{item.name}</span>}
                  </button>
                );
              })}
            </div>

          </div>
        ))}

      </div>
    </div>
  );

  return (
    <>
      {/* ---------- MOBILE BUTTON ---------- */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded bg-white dark:bg-gray-800 shadow"
      >
        <Menu size={18} />
      </button>

      {/* ---------- DESKTOP ---------- */}
      <div className="hidden md:block h-screen">
        {SidebarContent}
      </div>

      {/* ---------- MOBILE DRAWER ---------- */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">

          {/* Overlay */}
          <div
            className="flex-1 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />

          {/* Sidebar */}
          <div className="w-64 h-full bg-white dark:bg-gray-900 shadow-xl">

            {/* Close */}
            <div className="flex justify-end p-3">
              <button onClick={() => setMobileOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {SidebarContent}

          </div>

        </div>
      )}
    </>
  );
}
