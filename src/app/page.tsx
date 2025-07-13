"use client";

import React, { useState, useMemo } from "react";
import type { Transaction } from "@/lib/types";
import { useLanguage } from "@/contexts/language-provider";
import MainLayout from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MinusCircle, Wallet } from "lucide-react";
import { TransactionDialog } from "@/components/transaction-dialog";

const initialTransactions: Transaction[] = [
  {
    id: "1",
    type: "in",
    amount: 5000,
    description: "Salary",
    date: new Date(new Date().setDate(1)),
  },
  {
    id: "2",
    type: "out",
    amount: 1200,
    description: "Groceries",
    date: new Date(new Date().setDate(2)),
  },
  {
    id: "3",
    type: "out",
    amount: 300,
    description: "Coffee",
    date: new Date(new Date().setDate(3)),
  },
  {
    id: "4",
    type: "in",
    amount: 500,
    description: "Freelance Project",
    date: new Date(new Date().setDate(5)),
  },
];

export default function DashboardPage() {
  const { t } = useLanguage();
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"in" | "out">("in");

  const balance = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      return curr.type === "in" ? acc + curr.amount : acc - curr.amount;
    }, 0);
  }, [transactions]);

  const handleAddTransaction = (newTransaction: Omit<Transaction, "id">) => {
    setTransactions([
      { ...newTransaction, id: new Date().toISOString() },
      ...transactions,
    ]);
  };

  const openDialog = (mode: "in" | "out") => {
    setDialogMode(mode);
    setDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="grid gap-4 md:gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("current_balance")}
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-4xl font-bold font-headline">
              PKR {balance.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            size="lg"
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => openDialog("in")}
          >
            <PlusCircle className="mr-2 h-5 w-5" /> {t("cash_in")}
          </Button>
          <Button size="lg" variant="destructive" className="w-full" onClick={() => openDialog("out")}>
            <MinusCircle className="mr-2 h-5 w-5" /> {t("cash_out")}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("recent_transactions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("date")}</TableHead>
                  <TableHead>{t("description")}</TableHead>
                  <TableHead>{t("type")}</TableHead>
                  <TableHead className="text-right">{t("amount")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length > 0 ? (
                  transactions.slice(0, 5).map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        {tx.date.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {tx.description}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={tx.type === "in" ? "secondary" : "destructive"}
                          className={tx.type === "in" ? 'bg-accent/20 text-accent-foreground border-accent/20' : ''}
                        >
                          {t(tx.type === 'in' ? 'cash_in' : 'cash_out')}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          tx.type === "in" ? "text-accent-foreground" : "text-destructive"
                        }`}
                      >
                        {tx.type === "in" ? "+" : "-"} PKR {tx.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      {t("no_transactions")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        onSubmit={handleAddTransaction}
      />
    </MainLayout>
  );
}
