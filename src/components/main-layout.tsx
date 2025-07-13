"use client";

import Header from "@/components/header";
import { useLanguage } from "@/contexts/language-provider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { dir } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col bg-secondary/50" dir={dir}>
      <Header />
      <main className="flex-1 container mx-auto py-6 px-4 md:px-6">
        {children}
      </main>
    </div>
  );
}
