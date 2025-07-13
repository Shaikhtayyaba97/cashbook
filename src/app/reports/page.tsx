
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/main-layout";
import { useLanguage } from "@/contexts/language-provider";
import { useAuth } from "@/contexts/auth-provider";
import type { Transaction } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, Scale, Pencil, Trash2 } from "lucide-react";
import { TransactionDialog } from "@/components/transaction-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function ReportsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { userPhone, isAuthenticated } = useAuth();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().getMonth().toString()
  );
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"in" | "out">("in");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && userPhone) {
      try {
        const savedTransactions = window.localStorage.getItem(`transactions-${userPhone}`);
        if (savedTransactions) {
          setTransactions(JSON.parse(savedTransactions).map((tx: Transaction) => ({
            ...tx,
            date: new Date(tx.date),
          })));
        } else {
            setTransactions([]);
        }
      } catch (error) {
        console.error("Error reading from localStorage", error);
        setTransactions([]);
      }
    }
  }, [isAuthenticated, userPhone]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (isAuthenticated && userPhone && event.key === `transactions-${userPhone}`) {
        try {
            const savedTransactions = window.localStorage.getItem(`transactions-${userPhone}`);
            if (savedTransactions) {
                setTransactions(JSON.parse(savedTransactions).map((tx: Transaction) => ({
                    ...tx,
                    date: new Date(tx.date),
                })));
            }
        } catch (error) {
            console.error("Error reading from localStorage", error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated, userPhone]);

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i.toString(),
    label: new Date(0, i).toLocaleString("default", { month: "long" }),
  }));

  const filteredTransactions = useMemo(() => {
    return transactions.filter(
      (tx) => tx.date.getMonth().toString() === selectedMonth
    );
  }, [transactions, selectedMonth]);

  const summary = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, tx) => {
        if (tx.type === "in") {
          acc.totalIn += tx.amount;
        } else {
          acc.totalOut += tx.amount;
        }
        acc.netBalance = acc.totalIn - acc.totalOut;
        return acc;
      },
      { totalIn: 0, totalOut: 0, netBalance: 0 }
    );
  }, [filteredTransactions]);
  
  const handleAddOrUpdateTransaction = (transactionData: Omit<Transaction, "id" | "date"> & { id?: string; date?: Date }) => {
    let updatedTransactions;
    if (editingTransaction && transactionData.id) {
      updatedTransactions = transactions.map(tx => 
        tx.id === transactionData.id ? { ...tx, ...transactionData, date: tx.date } : tx
      );
      toast({ title: "✅ Transaction updated!" });
    } else {
      updatedTransactions = [
        { ...transactionData, id: new Date().toISOString(), date: new Date() },
        ...transactions,
      ];
    }
    setTransactions(updatedTransactions);
    if (isAuthenticated && userPhone) {
        window.localStorage.setItem(`transactions-${userPhone}`, JSON.stringify(updatedTransactions));
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    const updatedTransactions = transactions.filter(tx => tx.id !== id);
    setTransactions(updatedTransactions);
     if (isAuthenticated && userPhone) {
        window.localStorage.setItem(`transactions-${userPhone}`, JSON.stringify(updatedTransactions));
    }
    toast({ title: "🗑️ Transaction deleted", variant: "destructive" });
  };
  
  const openDialog = (mode: "in" | "out", transaction: Transaction | null = null) => {
    setDialogMode(mode);
    setEditingTransaction(transaction);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTransaction(null);
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold font-headline">{t("monthly_reports")}</h1>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder={t("select_month")} />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("total_in")}</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                PKR {summary.totalIn.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("total_out")}</CardTitle>
              <ArrowDownLeft className="h-4 w-4 text-muted-foreground text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                PKR {summary.totalOut.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("net_balance")}</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.netBalance < 0 ? 'text-destructive' : ''}`}>
                PKR {summary.netBalance.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("all_transactions")} - {months.find(m => m.value === selectedMonth)?.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("date")}</TableHead>
                  <TableHead>{t("description")}</TableHead>
                  <TableHead>{t("type")}</TableHead>
                  <TableHead>{t("amount")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.sort((a,b) => b.date.getTime() - a.date.getTime()).map((tx) => (
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
                        className={`font-medium ${
                          tx.type === "in" ? "text-accent" : "text-destructive"
                        }`}
                      >
                        {tx.type === "in" ? "+" : "-"} PKR {tx.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog(tx.type, tx)}>
                              <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete this transaction.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteTransaction(tx.id)} className="bg-destructive hover:bg-destructive/90">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      {t("no_transactions_month")}
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
        onOpenChange={closeDialog}
        mode={dialogMode}
        onSubmit={handleAddOrUpdateTransaction}
        transaction={editingTransaction}
      />
    </MainLayout>
  );
}
