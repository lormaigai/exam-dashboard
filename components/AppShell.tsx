"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  Clock3,
  Download,
  LayoutDashboard,
  Moon,
  Settings,
  Sparkles,
  Sun,
  Target,
  Timer
} from "lucide-react";
import { useExamData } from "@/lib/useExamData";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/subjects", label: "Subjects", icon: Target },
  { href: "/planner", label: "Planner", icon: CalendarDays },
  { href: "/focus", label: "Focus", icon: Timer },
  { href: "/timeline", label: "Timeline", icon: Clock3 },
  { href: "/mistakes", label: "Mistakes", icon: CheckSquare },
  { href: "/sessions", label: "Sessions", icon: BarChart3 },
  { href: "/weekly-review", label: "Review", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const store = useExamData();

  if (!store) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper text-ink dark:bg-[#111817] dark:text-white">
        <div className="rounded-lg border border-black/10 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/5">
          Loading ExamOS...
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink dark:bg-[#111817] dark:text-[#eef2ef]">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-black/10 bg-white/80 p-4 backdrop-blur lg:block dark:border-white/10 dark:bg-[#18211f]/80">
        <Link href="/dashboard" className="mb-6 flex items-center gap-3 rounded-lg px-2 py-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-pine text-lg font-bold text-white">
            E
          </span>
          <span>
            <span className="block text-lg font-semibold">ExamOS</span>
            <span className="text-xs text-ink/60 dark:text-white/55">Private exam cockpit</span>
          </span>
        </Link>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                  active
                    ? "bg-pine text-white"
                    : "text-ink/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-black/10 bg-paper/90 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-[#111817]/90">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink/50 dark:text-white/45">Rule-based study dashboard</p>
              <h1 className="text-xl font-semibold">ExamOS</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="focus-ring rounded-md border border-black/10 bg-white p-2 hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                onClick={store.toggleDarkMode}
                title={store.data.settings.darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {store.data.settings.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <Link
                href="/settings"
                className="focus-ring rounded-md border border-black/10 bg-white p-2 hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                title="Export or import data"
              >
                <Download className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm ${
                    active ? "bg-pine text-white" : "bg-white text-ink/75 dark:bg-white/5 dark:text-white/75"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
