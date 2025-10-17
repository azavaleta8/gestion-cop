"use client";

import { signOut } from "next-auth/react";
import { Button } from "@heroui/react";

export default function LogoutButton() {
  return (
    <Button color="primary" onClick={() => signOut({ callbackUrl: "/" })}>
      Cerrar sesión
    </Button>
  );
}
