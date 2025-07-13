"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/language-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { HandCoins, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t, dir } = useLanguage();

  const loginSchema = z.object({
    phone: z.string().min(10, "Phone number is too short"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "", password: "" },
  });

  function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    console.log(values);
    // In a real app, you'd call your authentication API here.
    // For this prototype, we'll just show a success message and redirect.
    toast({
      title: "✅ " + t("login_success"),
      description: "Redirecting to your dashboard...",
    });
    router.push("/");
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-secondary/50 p-4"
      dir={dir}
    >
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
            <HandCoins className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">
            {t("appName")}
          </CardTitle>
          <CardDescription>
            Enter your credentials to login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
              className="space-y-4"
            >
              <FormField
                control={loginForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("phone_number")}</FormLabel>
                    <FormControl>
                      <Input placeholder="+92 300 1234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("password")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                <LogIn className="mr-2 h-4 w-4" />
                {t("login")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
