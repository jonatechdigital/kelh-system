"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { CalendarIcon, LayoutDashboard, Users, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/patients", label: "Patients", icon: Users },
  { href: "/dashboard/expenses", label: "Expenses", icon: Receipt },
] as const;

function getDateParam(searchParams: ReturnType<typeof useSearchParams>): string {
  const date = searchParams.get("date");
  if (date) return date;
  return new Date().toISOString().slice(0, 10);
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentDate = getDateParam(searchParams);

  function onSelectDate(date: Date | undefined) {
    if (!date) return;
    const dateStr = date.toISOString().slice(0, 10);
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", dateStr);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-56 flex-col border-r border-border bg-card">
        <div className="flex h-14 items-center border-b border-border px-4">
          <span className="font-semibold text-foreground">
            KELH Management
          </span>
        </div>
        <nav className="flex flex-col gap-1 p-2">
          {nav.map((item) => (
            <Link key={item.href} href={item.href + (currentDate ? `?date=${currentDate}` : "")}>
              <Button
                variant="ghost"
                className={cn(
                  "h-11 w-full justify-start gap-3 font-medium",
                  pathname === item.href
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-end gap-2 border-b border-border bg-card px-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 font-medium text-foreground"
              >
                <CalendarIcon className="size-4" />
                {currentDate}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={new Date(currentDate + "T12:00:00.000Z")}
                onSelect={onSelectDate}
                defaultMonth={new Date(currentDate + "T12:00:00.000Z")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </header>
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
