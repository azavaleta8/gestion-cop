"use client";

import { HeroUIProvider } from "@heroui/react";
import { SessionProvider } from "next-auth/react";

export function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      <HeroUIProvider>{children}</HeroUIProvider>
    </SessionProvider>
  );
}
