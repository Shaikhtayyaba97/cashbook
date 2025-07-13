
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Transaction } from "@/lib/types";
import { useLanguage } from "@/contexts/language-provider";
import { useAuth } from "@/contexts/auth-provider";
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
import { PlusCircle, MinusCircle, Wallet, Pencil, Trash2 } from "lucide-react";
import { TransactionDialog } from "@/components/transaction-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from "@/services/transaction-service";


export default function DashboardPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { userPhone, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"in" | "out">("in");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const loadTransactions = useCallback(async () => {
    if (isAuthenticated && userPhone) {
      setIsLoading(true);
      const userTransactions = await getTransactions(userPhone);
      setTransactions(userTransactions);
      setIsLoading(false);
    }
  }, [isAuthenticated, userPhone]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);


  const balance = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      return curr.type === "in" ? acc + curr.amount : acc - curr.amount;
    }, 0);
  }, [transactions]);

  const handleAddOrUpdateTransaction = async (transactionData: Omit<Transaction, "id" | "date"> & { id?: string; date?: Date }) => {
    if (!userPhone) return;
    
    if (editingTransaction && transactionData.id) {
      await updateTransaction(userPhone, { ...transactionData, date: editingTransaction.date } as Transaction);
      toast({ title: "✅ Transaction updated!" });
    } else {
      await addTransaction(userPhone, { ...transactionData, type: dialogMode });
    }
    await loadTransactions();
    setEditingTransaction(null);
  };
  
  const handleDeleteTransaction = async (id: string) => {
    if (!userPhone) return;
    await deleteTransaction(userPhone, id);
    await loadTransactions();
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

  if (!isAuthenticated || isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-full">
           <p>Loading...</p>
        </div>
      </MainLayout>
    )
  }

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
                  <TableHead>{t("amount")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length > 0 ? (
                  transactions.slice(0, 5).map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        {new Date(tx.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {tx.description}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={tx.type === "in" ? "secondary" : "destructive"}
                          className={tx.type === 'in' ? 'bg-accent/20 text-accent-foreground border-accent/20' : ''}
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
                    <TableCell colSpan={5} className="text-center">
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
        onOpenChange={closeDialog}
        mode={dialogMode}
        onSubmit={handleAddOrUpdateTransaction}
        transaction={editingTransaction}
      />
    </MainLayout>
  );
}
