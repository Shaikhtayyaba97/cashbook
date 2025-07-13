"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLanguage } from "@/contexts/language-provider";
import type { Transaction } from "@/lib/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "in" | "out";
  onSubmit: (data: Omit<Transaction, "id">) => void;
}

export function TransactionDialog({
  open,
  onOpenChange,
  mode,
  onSubmit,
}: TransactionDialogProps) {
  const { t } = useLanguage();

  const formSchema = z.object({
    amount: z.coerce.number().min(1, { message: t("amount_required") }),
    description: z.string().min(1, { message: t("description_required") }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      description: "",
    },
  });

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      type: mode,
      amount: values.amount,
      description: values.description,
      date: new Date(),
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "in" ? t("cash_in") : t("cash_out")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("amount")}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="PKR" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("description")}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t("description")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  {t("cancel")}
                </Button>
              </DialogClose>
              <Button type="submit">{t("submit")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
