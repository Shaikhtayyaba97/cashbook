"use client";

import React, { useState, useMemo } from "react";
import MainLayout from "@/components/main-layout";
import { useLanguage } from "@/contexts/language-provider";
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
import { ArrowUpRight, ArrowDownLeft, Scale } from "lucide-react";

const dummyTransactions: Transaction[] = [
  { id: "1", type: "in", amount: 50000, description: "Salary - Jan", date: new Date("2024-01-01") },
  { id: "2", type: "out", amount: 15000, description: "Rent - Jan", date: new Date("2024-01-05") },
  { id: "3", type: "in", amount: 75000, description: "Salary - Feb", date: new Date("2024-02-01") },
  { id: "4", type: "out", amount: 15000, description: "Rent - Feb", date: new Date("2024-02-05") },
  { id: "5", type: "out", amount: 5000, description: "Utilities - Feb", date: new Date("2024-02-10") },
  { id: "6", type: "in", amount: 75000, description: "Salary - Mar", date: new Date("2024-03-01") },
  { id: "7", type: "out", amount: 15000, description: "Rent - Mar", date: new Date("2024-03-05") },
];


export default function ReportsPage() {
  const { t } = useLanguage();
  const [transactions] = useState<Transaction[]>(dummyTransactions);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().getMonth().toString()
  );

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
              <div className="text-2xl font-bold">
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
                  <TableHead className="text-right">{t("amount")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
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
                    <TableCell colSpan={4} className="text-center h-24">
                      {t("no_transactions")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </MainLayout>
  );
}
