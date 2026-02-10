"use client";

import { useState, useCallback } from "react";
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

const DOCTORS = ["Dr. Rashid", "Dr. Mogi", "Dr. Arua", "Optical Team"] as const;

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
      });
      if (reg)
        await handleStartVisit(reg.id, true, {
          name: registerName.trim(),
          file_number: reg.file_number,
        });
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
  const [consultationStatus, setConsultationStatus] = useState<
    "pending" | "paid" | "waived"
  >(visit.consultation_status);
  const [findings, setFindings] = useState(visit.findings ?? "");
  const [treatmentCost, setTreatmentCost] = useState(
    String(visit.treatment_cost || 0)
  );
  const [saving, setSaving] = useState(false);

  async function handleSaveSection(updates: UpdateVisitData) {
    setSaving(true);
    try {
      await onUpdate(visit.id, updates);
      await onReload();
    } finally {
      setSaving(false);
    }
  }

  async function handleCloseVisitClick() {
    setSaving(true);
    try {
      await onUpdate(visit.id, {
        doctor: doctor || undefined,
        consultation_status: consultationStatus,
        treatment_cost: Number(treatmentCost) || 0,
        findings: findings || undefined,
        status: "closed",
      });
      onCloseVisit(visit.id);
    } finally {
      setSaving(false);
    }
  }

  const consultationFee = Number(visit.consultation_fee) || 0;
  const consultationDisplay = new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(consultationFee);

  return (
    <div className="grid gap-6 py-2">
      {/* Section A: Reception – Assign Doctor */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Reception
        </h3>
        <div className="grid gap-2">
          <Label>Doctor</Label>
          <Select
            value={doctor}
            onValueChange={(v) => {
              setDoctor(v);
              handleSaveSection({ doctor: v });
            }}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Assign doctor" />
            </SelectTrigger>
            <SelectContent>
              {DOCTORS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Section B: Financial – Consultation Fee + Paid/Waived */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Financial
        </h3>
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">Consultation fee</p>
          <p className="text-xl font-bold text-foreground">
            {consultationDisplay}
          </p>
          <div className="mt-2 flex gap-2">
            {(["pending", "paid", "waived"] as const).map((s) => (
              <Button
                key={s}
                type="button"
                variant={consultationStatus === s ? "default" : "outline"}
                size="sm"
                className={
                  s === "paid"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : s === "waived"
                      ? "bg-muted"
                      : ""
                }
                disabled={saving}
                onClick={() => {
                  setConsultationStatus(s);
                  handleSaveSection({ consultation_status: s });
                }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Section C: Doctor – Findings */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Doctor
        </h3>
        <div className="grid gap-2">
          <Label htmlFor="findings">Findings / Recommendations</Label>
          <Textarea
            id="findings"
            value={findings}
            onChange={(e) => setFindings(e.target.value)}
            onBlur={() =>
              findings !== (visit.findings ?? "") &&
              handleSaveSection({ findings })
            }
            placeholder="Clinical notes..."
            className="min-h-24"
          />
        </div>
      </section>

      {/* Section D: Checkout – Treatment Cost + Close Visit */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Checkout
        </h3>
        <div className="grid gap-2">
          <Label htmlFor="treatment-cost">Treatment cost</Label>
          <Input
            id="treatment-cost"
            type="number"
            min={0}
            step={0.01}
            value={treatmentCost}
            onChange={(e) => setTreatmentCost(e.target.value)}
            onBlur={() =>
              handleSaveSection({
                treatment_cost: Number(treatmentCost) || 0,
              })
            }
            className="h-10"
          />
        </div>
        <Button
          size="lg"
          className="mt-4 w-full bg-emerald-600 text-lg font-semibold hover:bg-emerald-700"
          disabled={saving}
          onClick={handleCloseVisitClick}
        >
          {saving ? "Closing…" : "Close Visit"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Marks visit as closed and paid.
        </p>
      </section>
    </div>
  );
}
