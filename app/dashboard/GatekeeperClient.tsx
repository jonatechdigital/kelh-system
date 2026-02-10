"use client";

import { useState, useCallback, useEffect } from "react";
import {
  searchPatients,
  registerPatient,
  startVisit,
  updateVisit,
  getVisitByIdAction,
  type SearchPatientRow,
  type UpdateVisitData,
} from "@/app/actions/flow";
import type { VisitWithPatient } from "@/lib/getVisits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DOCTOR_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  SERVICE_CATEGORIES,
} from "@/lib/kelhConstants";
import type { VisitServiceItem } from "@/lib/getVisits";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = { initialActiveVisits: VisitWithPatient[] };

export function GatekeeperClient({ initialActiveVisits }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchPatientRow[] | null>(
    null
  );
  const [isSearching, setIsSearching] = useState(false);
  const [activeVisits, setActiveVisits] = useState<VisitWithPatient[]>(
    initialActiveVisits
  );
  const [visitCardId, setVisitCardId] = useState<string | null>(null);
  const [visitCardData, setVisitCardData] = useState<VisitWithPatient | null>(
    null
  );
  const [visitCardLoading, setVisitCardLoading] = useState(false);
  const [registerMode, setRegisterMode] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const [registerReferral, setRegisterReferral] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await loadVisit(visitId);
    },
    [loadVisit]
  );

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setIsSearching(true);
    setSearchResults(null);
    const results = await searchPatients(q);
    setSearchResults(results);
    setIsSearching(false);
  }

  async function handleStartVisit(
    patientId: string,
    isNew: boolean,
    patientDisplay?: { name: string; file_number: string | null }
  ) {
    setIsSubmitting(true);
    try {
      const res = await startVisit(patientId, isNew);
      if (res?.id) {
        setSearchQuery("");
        setSearchResults(null);
        setRegisterMode(false);
        const name =
          patientDisplay?.name ?? (registerMode ? registerName : "");
        const file_number = patientDisplay?.file_number ?? null;
        setRegisterName("");
        setRegisterReferral("");
        setActiveVisits((prev) => {
          const next = [...prev];
          next.unshift({
            id: res.id,
            patient_id: patientId,
            created_at: new Date().toISOString(),
            consultation_fee: isNew ? 80000 : 0,
            consultation_status: "pending",
            treatment_cost: 0,
            doctor: "",
            findings: "",
            status: "active",
            patient: {
              id: patientId,
              name,
              file_number,
            },
          } as VisitWithPatient);
          return next;
        });
        await openVisitCard(res.id);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!registerName.trim()) return;
    setIsSubmitting(true);
    try {
      const reg = await registerPatient({
        name: registerName.trim(),
        referral: registerReferral.trim() || undefined,
        doctor: "",
        paymentMethod: "",
      });
      if (reg?.visitId) {
        setSearchQuery("");
        setSearchResults(null);
        setRegisterMode(false);
        setRegisterName("");
        setRegisterReferral("");
        setActiveVisits((prev) => {
          const next = [...prev];
          next.unshift({
            id: reg.visitId,
            patient_id: reg.id,
            created_at: new Date().toISOString(),
            consultation_fee: 80000,
            consultation_status: "pending",
            treatment_cost: 0,
            total_paid: 0,
            total_amount: 80000,
            payment_method: "",
            doctor: "",
            referral_source: "",
            services: [
              { id: crypto.randomUUID(), category: "Consultation", name: "Initial Consultation", price: 80000 },
            ],
            findings: "",
            status: "triage",
            patient: {
              id: reg.id,
              name: registerName.trim(),
              file_number: reg.file_number,
            },
          } as VisitWithPatient);
          return next;
        });
        await openVisitCard(reg.visitId);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCloseVisitCard(closedVisitId?: string) {
    if (closedVisitId) {
      setActiveVisits((prev) => prev.filter((v) => v.id !== closedVisitId));
    }
    setVisitCardId(null);
    setVisitCardData(null);
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* State 1 & 2: Search */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <Input
            type="search"
            placeholder="Search by name or file number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 flex-1 text-base"
            autoFocus
          />
          <Button type="submit" size="lg" className="h-12 px-6" disabled={isSearching}>
            {isSearching ? "Searching…" : "Search"}
          </Button>
        </div>
      </form>

      {/* State 2: Search results */}
      {searchResults !== null && (
        <Card className="mb-8 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Search results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {searchResults.length === 0 ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">No patient found.</p>
                {!registerMode ? (
                  <Button
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => setRegisterMode(true)}
                  >
                    Register New Patient
                  </Button>
                ) : (
                  <form onSubmit={handleRegister} className="grid gap-4 rounded-lg border p-4">
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
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setRegisterMode(false);
                          setRegisterName("");
                          setRegisterReferral("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Registering…" : "Register & Start Visit"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <ul className="space-y-2">
                {searchResults.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded-md border bg-card px-4 py-3"
                  >
                    <span className="font-medium text-foreground">
                      {p.name}
                      {p.file_number && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          {p.file_number}
                        </span>
                      )}
                    </span>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={isSubmitting}
                      onClick={() =>
                        handleStartVisit(p.id, false, {
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
          </CardContent>
        </Card>
      )}

      {/* State 1: Today's Active Visits */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Today&apos;s Active Visits</CardTitle>
          <p className="text-sm text-muted-foreground">
            Who is currently in the clinic
          </p>
        </CardHeader>
        <CardContent>
          {activeVisits.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              No active visits. Search and start a visit.
            </p>
          ) : (
            <ul className="space-y-2">
              {activeVisits.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between rounded-md border bg-muted/30 px-4 py-3"
                >
                  <div>
                    <span className="font-medium text-foreground">
                      {v.patient?.name ?? "—"}
                    </span>
                    {v.patient?.file_number && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        {v.patient.file_number}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openVisitCard(v.id)}
                  >
                    Open
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* State 3: Visit Card Dialog */}
      <Dialog open={!!visitCardId} onOpenChange={(open) => !open && handleCloseVisitCard()}>
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
              onCloseVisit={(closedId) => handleCloseVisitCard(closedId)}
              onReload={() => (visitCardId ? loadVisit(visitCardId) : Promise.resolve())}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const nfVisit = new Intl.NumberFormat("en-NG", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function VisitCardForm({
  visit,
  onUpdate,
  onCloseVisit,
  onReload,
}: {
  visit: VisitWithPatient;
  onUpdate: (id: string, data: UpdateVisitData) => Promise<void>;
  onCloseVisit: (closedVisitId: string) => void;
  onReload: () => Promise<void>;
}) {
  const [doctor, setDoctor] = useState(visit.doctor ?? "");
  const visitServices = Array.isArray((visit as VisitWithPatient & { services?: VisitServiceItem[] }).services)
    ? (visit as VisitWithPatient & { services?: VisitServiceItem[] }).services!
    : [];
  const [services, setServices] = useState<VisitServiceItem[]>(visitServices);
  useEffect(() => {
    const next = Array.isArray((visit as VisitWithPatient & { services?: VisitServiceItem[] }).services)
      ? (visit as VisitWithPatient & { services?: VisitServiceItem[] }).services!
      : [];
    setServices(next);
  }, [visit.id, (visit as VisitWithPatient & { services?: VisitServiceItem[] }).services?.length]);

  const [totalPaid, setTotalPaid] = useState(
    String((visit as VisitWithPatient & { total_paid?: number }).total_paid ?? 0)
  );
  const [paymentMethod, setPaymentMethod] = useState(
    (visit as VisitWithPatient & { payment_method?: string }).payment_method ?? ""
  );
  const [findings, setFindings] = useState(visit.findings ?? "");
  const [saving, setSaving] = useState(false);
  const [addServiceOpen, setAddServiceOpen] = useState(false);

  const totalDue = services.reduce((sum, s) => sum + Number(s.price || 0), 0);

  async function handleSave(updates: UpdateVisitData) {
    setSaving(true);
    try {
      await onUpdate(visit.id, updates);
      await onReload();
    } finally {
      setSaving(false);
    }
  }

  function applyServices(next: VisitServiceItem[]) {
    setServices(next);
    const total = next.reduce((s, i) => s + Number(i.price || 0), 0);
    handleSave({ services: next, total_amount: total });
  }

  function addService(item: VisitServiceItem) {
    applyServices([...services, { ...item, id: item.id || crypto.randomUUID() }]);
    setAddServiceOpen(false);
  }

  function removeService(id: string) {
    applyServices(services.filter((s) => s.id !== id));
  }

  async function handleCloseVisitClick() {
    setSaving(true);
    try {
      await onUpdate(visit.id, {
        doctor: doctor || undefined,
        services,
        total_amount: totalDue,
        payment_method: paymentMethod || undefined,
      });
      onCloseVisit(visit.id);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 py-2">
      {/* Section A: Info */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Info
        </h3>
        <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
          <p className="font-medium text-foreground">
            {visit.patient?.name ?? "—"}
          </p>
          <p className="text-sm text-muted-foreground">
            File # {visit.patient?.file_number ?? "—"}
          </p>
          <div className="grid gap-2 pt-2">
            <Label>Assigned Doctor</Label>
            <Select
              value={doctor}
              onValueChange={(v) => {
                setDoctor(v);
                handleSave({ doctor: v });
              }}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Assign doctor" />
              </SelectTrigger>
              <SelectContent>
                {DOCTOR_OPTIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Section B: Service List */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Service List
        </h3>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold text-right">Price</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                    No services. Add one below.
                  </TableCell>
                </TableRow>
              ) : (
                services.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {nfVisit.format(Number(s.price) || 0)}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        disabled={saving}
                        onClick={() => removeService(s.id)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-3">
            <span className="font-semibold text-foreground">Total Due</span>
            <span className="text-lg font-bold tabular-nums">{nfVisit.format(totalDue)}</span>
          </div>
          <div className="p-2 border-t">
            <Popover open={addServiceOpen} onOpenChange={setAddServiceOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="w-full">
                  + Add Service
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <AddServiceForm
                  onAdd={addService}
                  onCancel={() => setAddServiceOpen(false)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid gap-2 pt-2">
          <Label htmlFor="total-paid">Total Paid</Label>
          <Input
            id="total-paid"
            type="number"
            min={0}
            step={0.01}
            value={totalPaid}
            onChange={(e) => setTotalPaid(e.target.value)}
            onBlur={() => {}}
            className="h-10"
          />
        </div>
        <div className="grid gap-2">
          <Label>Payment Method</Label>
          <Select
            value={paymentMethod}
            onValueChange={(v) => {
              setPaymentMethod(v);
              handleSave({ payment_method: v });
            }}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHOD_OPTIONS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Section C: Findings */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Findings / Recommendations
        </h3>
        <Textarea
          value={findings}
          onChange={(e) => setFindings(e.target.value)}
          onBlur={() => {}}
          placeholder="Clinical notes..."
          className="min-h-20"
        />
      </section>

      {/* Section D: Actions */}
      <section className="flex gap-3">
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          disabled={saving}
          onClick={() =>
            handleSave({
              doctor: doctor || undefined,
              services,
              total_amount: totalDue,
              payment_method: paymentMethod || undefined,
            })
          }
        >
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button
          size="lg"
          className="flex-1 bg-emerald-600 text-lg font-semibold hover:bg-emerald-700"
          disabled={saving}
          onClick={handleCloseVisitClick}
        >
          {saving ? "Closing…" : "Close Visit"}
        </Button>
      </section>
    </div>
  );
}

function AddServiceForm({
  onAdd,
  onCancel,
}: {
  onAdd: (item: VisitServiceItem) => void;
  onCancel: () => void;
}) {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const p = Number(price) || 0;
    if (!description.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      category: category || "Other",
      name: description.trim(),
      price: p,
    });
    setCategory("");
    setDescription("");
    setPrice("");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <div className="grid gap-1.5">
        <Label>Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="add-desc">Description</Label>
        <Input
          id="add-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Cipro Drops"
          className="h-9"
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="add-price">Price</Label>
        <Input
          id="add-price"
          type="number"
          min={0}
          step={0.01}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0"
          className="h-9"
          required
        />
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm">
          Add
        </Button>
      </div>
    </form>
  );
}
