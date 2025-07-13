"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/language-provider";
import { useAuth } from "@/contexts/auth-provider";
import LanguageSwitcher from "@/components/language-switcher";
import { HandCoins } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function Header() {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="bg-card border-b shadow-sm sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg md:text-xl font-bold font-headline text-primary"
        >
          <HandCoins className="h-6 w-6" />
          <span>{t("appName")}</span>
        </Link>
        <nav className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            onClick={() => router.push("/reports")}
          >
            {t("reports")}
          </Button>
          <LanguageSwitcher />
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
          >
            {t("logout")}
          </Button>
        </nav>
      </div>
    </header>
  );
}
