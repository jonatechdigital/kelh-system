"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  searchPatients,
  registerPatient,
  startVisit,
  updateVisit,
  getVisitByIdAction,
  type SearchPatientRow,
} from "@/app/actions/flow";
import { addExpenseNoRedirect } from "@/app/actions/expenseActions";
import type { VisitWithPatient } from "@/lib/getVisits";
import type {
  DashboardPeriod,
  DashboardStats,
  RecentTransaction,
} from "@/app/actions/dashboardActions";
import { VisitCardForm } from "@/app/dashboard/GatekeeperClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
const CATEGORIES = [
  "Supplies",
  "Equipment",
  "Utilities",
  "Salaries",
  "Other",
] as const;

const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  today: "Today",
  yesterday: "Yesterday",
  weekly: "This Week",
  monthly: "This Month",
};

type Props = {
  period: DashboardPeriod;
  stats: DashboardStats;
  transactions: RecentTransaction[];
};

const nf = new Intl.NumberFormat("en-NG", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function DashboardClient({
  period,
  stats,
  transactions,
}: Props) {
  const router = useRouter();

  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [visitCardId, setVisitCardId] = useState<string | null>(null);
  const [visitCardData, setVisitCardData] = useState<VisitWithPatient | null>(
    null
  );
  const [visitCardLoading, setVisitCardLoading] = useState(false);

  const [registerName, setRegisterName] = useState("");
  const [registerReferral, setRegisterReferral] = useState("");
  const [registerSubmitting, setRegisterSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchPatientRow[] | null>(
    null
  );
  const [searching, setSearching] = useState(false);
  const [searchSubmitting, setSearchSubmitting] = useState(false);

  const [expenseSubmitting, setExpenseSubmitting] = useState(false);

  const loadVisit = useCallback(async (visitId: string) => {
    setVisitCardLoading(true);
    setVisitCardData(null);
    const v = await getVisitByIdAction(visitId);
    setVisitCardData(v);
    setVisitCardLoading(false);
  }, []);

  const openVisitCard = useCallback(
    async (visitId: string) => {
      setVisitCardId(visitId);
      setRegistrationOpen(false);
      setSearchOpen(false);
      await loadVisit(visitId);
    },
    [loadVisit]
  );

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!registerName.trim()) return;
    setRegisterSubmitting(true);
    try {
      const reg = await registerPatient({
        name: registerName.trim(),
        referral: registerReferral.trim() || undefined,
      });
      if (reg) {
        const res = await startVisit(reg.id, true);
        if (res?.id) {
          setRegisterName("");
          setRegisterReferral("");
          await openVisitCard(res.id);
        }
      }
    } finally {
      setRegisterSubmitting(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    setSearchResults(null);
    const results = await searchPatients(q);
    setSearchResults(results);
    setSearching(false);
  }

  async function handleStartVisitFromSearch(
    patientId: string,
    display: { name: string; file_number: string | null }
  ) {
    setSearchSubmitting(true);
    try {
      const res = await startVisit(patientId, false);
      if (res?.id) await openVisitCard(res.id);
    } finally {
      setSearchSubmitting(false);
    }
  }

  async function handleExpenseSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setExpenseSubmitting(true);
    try {
      const result = await addExpenseNoRedirect(formData);
      if (result.ok) {
        setExpenseOpen(false);
        form.reset();
        router.refresh();
      }
    } finally {
      setExpenseSubmitting(false);
    }
  }

  function handleCloseVisitCard() {
    setVisitCardId(null);
    setVisitCardData(null);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Jonatech Executive Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview and quick actions
        </p>
      </div>

      {/* SECTION 1: Date filters */}
      <section>
        <Tabs>
          <TabsList>
            {(["today", "yesterday", "weekly", "monthly"] as const).map(
              (p) => (
                <TabsTrigger
                  key={p}
                  href={`/dashboard?period=${p}`}
                  active={period === p}
                >
                  {PERIOD_LABELS[p]}
                </TabsTrigger>
              )
            )}
          </TabsList>
        </Tabs>
      </section>

      {/* SECTION 2: Quick actions */}
      <section className="flex flex-wrap gap-3">
        <Button
          size="lg"
          className="min-h-11 bg-emerald-600 px-6 font-semibold text-white hover:bg-emerald-700"
          onClick={() => setRegistrationOpen(true)}
        >
          New Patient
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="min-h-11 border-blue-500/50 bg-blue-500/10 px-6 font-semibold text-blue-700 hover:bg-blue-500/20 hover:text-blue-800 dark:text-blue-300 dark:hover:bg-blue-500/30"
          onClick={() => setSearchOpen(true)}
        >
          Old Patient
        </Button>
        <Button
          size="lg"
          className="min-h-11 bg-rose-600 px-6 font-semibold text-white hover:bg-rose-700"
          onClick={() => setExpenseOpen(true)}
        >
          New Expense
        </Button>
      </section>

      {/* SECTION 3: Financial stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Patients Seen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {stats.patientsSeen}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cash In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {nf.format(stats.cashIn)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cash Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
              {nf.format(stats.cashOut)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-primary/30 bg-primary/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Cash
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold tabular-nums ${
                stats.netCash >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {nf.format(stats.netCash)}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* SECTION 4: Recent transactions */}
      <section>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Last 5 visits and 5 expenses, merged by time
            </p>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Time</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="text-right font-semibold">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No transactions yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-muted-foreground">
                          {new Date(tx.time).toLocaleString(undefined, {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </TableCell>
                        <TableCell className="font-medium">
                          {tx.description}
                        </TableCell>
                        <TableCell>{tx.category}</TableCell>
                        <TableCell
                          className={`text-right font-semibold tabular-nums ${
                            tx.type === "income"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {tx.amount >= 0 ? "+" : ""}
                          {nf.format(tx.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Registration modal */}
      <Dialog open={registrationOpen} onOpenChange={setRegistrationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">New Patient</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegister} className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="reg-name">Patient name</Label>
              <Input
                id="reg-name"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                placeholder="Full name"
                className="h-10"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reg-referral">Referral (optional)</Label>
              <Input
                id="reg-referral"
                value={registerReferral}
                onChange={(e) => setRegisterReferral(e.target.value)}
                placeholder="e.g. Walk-in"
                className="h-10"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRegistrationOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={registerSubmitting}
              >
                {registerSubmitting ? "Registering…" : "Register & Start Visit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Search (Old Patient) modal */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Find Patient</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSearch} className="space-y-4 py-2">
            <div className="flex gap-2">
              <Input
                type="search"
                placeholder="Name or file number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 flex-1"
              />
              <Button type="submit" size="default" disabled={searching}>
                {searching ? "Searching…" : "Search"}
              </Button>
            </div>
            {searchResults !== null && (
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-2">
                {searchResults.length === 0 ? (
                  <p className="py-2 text-center text-sm text-muted-foreground">
                    No patient found.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {searchResults.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between rounded border bg-muted/30 px-3 py-2"
                      >
                        <span className="font-medium">
                          {p.name}
                          {p.file_number && (
                            <span className="ml-2 text-sm text-muted-foreground">
                              {p.file_number}
                            </span>
                          )}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          disabled={searchSubmitting}
                          onClick={() =>
                            handleStartVisitFromSearch(p.id, {
                              name: p.name,
                              file_number: p.file_number ?? null,
                            })
                          }
                        >
                          Start Visit
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* New Expense modal */}
      <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">New Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleExpenseSubmit} className="grid gap-5 py-2">
            <div className="grid gap-2">
              <Label htmlFor="exp-title">Title</Label>
              <Input
                id="exp-title"
                name="title"
                placeholder="e.g. Buying Gloves"
                className="h-10"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="exp-amount">Amount</Label>
              <Input
                id="exp-amount"
                name="amount"
                type="number"
                placeholder="0"
                min={0}
                step={0.01}
                className="h-10"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="exp-category">Category</Label>
              <Input
                id="exp-category"
                name="category"
                placeholder="e.g. Supplies"
                className="h-10"
                list="exp-categories"
                required
              />
              <datalist id="exp-categories">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setExpenseOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={expenseSubmitting}>
                {expenseSubmitting ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Visit card modal */}
      <Dialog
        open={!!visitCardId}
        onOpenChange={(open) => !open && handleCloseVisitCard()}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Visit {visitCardData?.patient?.name ?? "…"}
              {visitCardData?.patient?.file_number && (
                <span className="ml-2 text-base font-normal text-muted-foreground">
                  {visitCardData.patient.file_number}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {visitCardLoading ? (
            <p className="py-8 text-center text-muted-foreground">Loading…</p>
          ) : visitCardData ? (
            <VisitCardForm
              visit={visitCardData}
              onUpdate={updateVisit}
              onCloseVisit={handleCloseVisitCard}
              onReload={() => (visitCardId ? loadVisit(visitCardId) : Promise.resolve())}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
