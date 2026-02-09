"use client";

import { useState } from "react";
import { addPatient } from "@/app/actions/patientActions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PatientRow } from "@/lib/getPatients";

const SERVICES = ["Consultation", "Surgery", "Optical"] as const;
const REFERRALS = ["Walk-in", "Dr. Rashid", "Website", "Social Media"] as const;

type Props = { initialPatients: PatientRow[] };

export function DashboardClient({ initialPatients }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [service, setService] = useState<string>("");
  const [referral, setReferral] = useState<string>("");

  return (
    <main className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            KELH Reception Terminal
          </h1>
          <p className="mt-1 text-base text-muted-foreground">Dashboard</p>
        </header>

        <section className="mb-10">
          <Button
            size="lg"
            className="min-h-14 w-full min-w-[200px] bg-emerald-600 px-8 text-lg font-semibold text-white hover:bg-emerald-700 sm:w-auto"
            onClick={() => setDialogOpen(true)}
          >
            New Patient
          </Button>
        </section>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">New Patient</DialogTitle>
            </DialogHeader>
            <form action={addPatient} className="grid gap-5 py-2">
              <input type="hidden" name="service" value={service} />
              <input type="hidden" name="referral" value={referral} />
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-base">
                  Patient Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter name"
                  className="h-10"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="service" className="text-base">
                  Service
                </Label>
                <Select value={service} onValueChange={setService}>
                  <SelectTrigger id="service" className="h-10 w-full">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cost" className="text-base">
                  Cost
                </Label>
                <Input
                  id="cost"
                  name="cost"
                  type="number"
                  placeholder="0"
                  min={0}
                  step={0.01}
                  className="h-10"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="referral" className="text-base">
                  Referral
                </Label>
                <Select value={referral} onValueChange={setReferral}>
                  <SelectTrigger id="referral" className="h-10 w-full">
                    <SelectValue placeholder="Who sent them?" />
                  </SelectTrigger>
                  <SelectContent>
                    {REFERRALS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Today&apos;s Patients
          </h2>
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base font-semibold">Name</TableHead>
                  <TableHead className="text-base font-semibold">
                    Service
                  </TableHead>
                  <TableHead className="text-base font-semibold">Cost</TableHead>
                  <TableHead className="text-base font-semibold">Status</TableHead>
                  <TableHead className="text-base font-semibold">
                    Referral
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialPatients.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No patients today yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  initialPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="text-base font-medium text-foreground">
                        {patient.name}
                      </TableCell>
                      <TableCell className="text-base text-foreground">
                        {patient.service}
                      </TableCell>
                      <TableCell className="text-base text-foreground">
                        {patient.cost}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            patient.status === "paid"
                              ? "rounded-md bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700"
                              : "rounded-md bg-rose-100 px-2 py-0.5 font-semibold text-rose-700"
                          }
                        >
                          {patient.status === "paid" ? "Paid" : "Pending"}
                        </span>
                      </TableCell>
                      <TableCell className="text-base text-foreground">
                        {patient.referral}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </main>
  );
}
