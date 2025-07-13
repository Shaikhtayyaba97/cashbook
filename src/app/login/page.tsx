"use client";

import { useState } from "react";
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
import { HandCoins, KeyRound, MessageSquareCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t, dir } = useLanguage();
  const [step, setStep] = useState(1);
  const [fakeOtp, setFakeOtp] = useState<string | null>(null);

  const loginSchema = z.object({
    phone: z.string().min(10, "Phone number is too short"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  const otpSchema = z.object({
    otp: z.string().length(6, "OTP must be 6 digits"),
  });

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "", password: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    console.log(values);
    // In a real app, you'd call your auth API here to send an OTP.
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setFakeOtp(generatedOtp);
    setStep(2);
  }

  function onOtpSubmit(values: z.infer<typeof otpSchema>) {
    console.log(values);
    // In a real app, you'd verify the OTP here.
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
            {step === 1
              ? "Enter your credentials to login"
              : "Enter the OTP sent to your phone"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
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
                  <KeyRound className="mr-2 h-4 w-4" />
                  {t("send_otp")}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...otpForm}>
              <form
                onSubmit={otpForm.handleSubmit(onOtpSubmit)}
                className="space-y-4"
              >
                {fakeOtp && (
                  <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Demo OTP</AlertTitle>
                    <AlertDescription>
                      Your one-time password is:{" "}
                      <strong className="font-mono">{fakeOtp}</strong>
                    </AlertDescription>
                  </Alert>
                )}
                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("otp")}</FormLabel>
                      <FormControl>
                        <Input placeholder="123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  <MessageSquareCode className="mr-2 h-4 w-4" />
                  {t("verify_otp")}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
