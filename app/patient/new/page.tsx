import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewPatientPage() {
  return (
    <main className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-2xl">
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="mb-6">
            ← Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Patient</h1>
        <p className="mt-2 text-muted-foreground">
          Patient entry form will go here (Name, Service, Cost, Referral).
        </p>
      </div>
    </main>
  );
}
