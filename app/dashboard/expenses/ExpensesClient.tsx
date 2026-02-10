"use client";

import { useState } from "react";
import { addExpense } from "@/app/actions/expenseActions";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ExpenseRow } from "@/lib/getExpenses";

const CATEGORIES = [
  "Supplies",
  "Equipment",
  "Utilities",
  "Salaries",
  "Other",
] as const;

type Props = { initialExpenses: ExpenseRow[]; selectedDate: string };

export function ExpensesClient({
  initialExpenses,
  selectedDate,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Expenses
        </h1>
        <Button
          size="lg"
          className="min-h-12 bg-rose-600 px-6 text-base font-semibold text-white hover:bg-rose-700"
          onClick={() => setDialogOpen(true)}
        >
          New Expense
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">New Expense</DialogTitle>
          </DialogHeader>
          <form action={addExpense} className="grid gap-5 py-2">
            <input type="hidden" name="date" value={selectedDate} />
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-base">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Buying Gloves"
                className="h-10"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount" className="text-base">
                Amount
              </Label>
              <Input
                id="amount"
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
              <Label htmlFor="category" className="text-base">
                Category
              </Label>
              <Input
                id="category"
                name="category"
                placeholder="e.g. Supplies"
                className="h-10"
                list="categories"
                required
              />
              <datalist id="categories">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
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
              <TableHead className="text-base font-semibold">Title</TableHead>
              <TableHead className="text-base font-semibold">Category</TableHead>
              <TableHead className="text-base font-semibold text-right">
                Amount
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialExpenses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-8 text-center text-muted-foreground"
                >
                  No expenses for this date.
                </TableCell>
              </TableRow>
            ) : (
              initialExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="text-base font-medium text-foreground">
                    {expense.title}
                  </TableCell>
                  <TableCell className="text-base text-foreground">
                    {expense.category}
                  </TableCell>
                  <TableCell className="text-right text-base font-semibold text-rose-700 dark:text-rose-400">
                    {Number(expense.amount).toFixed(2)}
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
