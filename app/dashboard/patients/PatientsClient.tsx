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
const DOCTORS = ["Dr. Rashid", "Dr. Mogi", "Dr. Arua", "Optical Team"] as const;
const STATUS_OPTIONS = ["Paid", "Pending"] as const;

type Props = { initialPatients: PatientRow[]; selectedDate: string };

export function PatientsClient({ initialPatients, selectedDate }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [service, setService] = useState<string>("");
  const [referral, setReferral] = useState<string>("");
  const [doctor, setDoctor] = useState<string>("");
  const [status, setStatus] = useState<string>("Pending");

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Patients
        </h1>
        <Button
          size="lg"
          className="min-h-12 bg-emerald-600 px-6 text-base font-semibold text-white hover:bg-emerald-700"
          onClick={() => setDialogOpen(true)}
        >
          New Patient
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">New Patient</DialogTitle>
          </DialogHeader>
          <form action={addPatient} className="grid gap-5 py-2">
            <input type="hidden" name="service" value={service} />
            <input type="hidden" name="referral" value={referral} />
            <input type="hidden" name="doctor" value={doctor} />
            <input type="hidden" name="status" value={status} />
            <input type="hidden" name="date" value={selectedDate} />
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
              <Label htmlFor="phone" className="text-base">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Phone number"
                className="h-10"
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
              <Label htmlFor="doctor" className="text-base">
                Doctor
              </Label>
              <Select value={doctor} onValueChange={setDoctor}>
                <SelectTrigger id="doctor" className="h-10 w-full">
                  <SelectValue placeholder="Select doctor" />
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
            <div className="grid gap-2">
              <Label htmlFor="status" className="text-base">
                Payment Status
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status" className="h-10 w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
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

      <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base font-semibold">Name</TableHead>
                <TableHead className="text-base font-semibold">Phone</TableHead>
                <TableHead className="text-base font-semibold">File #</TableHead>
                <TableHead className="text-base font-semibold">Service</TableHead>
                <TableHead className="text-base font-semibold">Doctor</TableHead>
                <TableHead className="text-base font-semibold">Status</TableHead>
                <TableHead className="text-base font-semibold">Referral</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialPatients.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No patients for this date.
                  </TableCell>
                </TableRow>
              ) : (
              initialPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="text-base font-medium text-foreground">
                    {patient.name}
                  </TableCell>
                  <TableCell className="text-base text-foreground">
                    {patient.phone ?? "—"}
                  </TableCell>
                  <TableCell className="text-base text-foreground">
                    {patient.file_number ?? "—"}
                  </TableCell>
                  <TableCell className="text-base text-foreground">
                    {patient.service ?? "—"}
                  </TableCell>
                  <TableCell>
                    <span className="rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-sm font-medium text-foreground">
                      {patient.doctor ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        patient.status === "paid"
                          ? "rounded-md bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                          : "rounded-md bg-rose-100 px-2 py-0.5 font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
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
    </div>
  );
}
