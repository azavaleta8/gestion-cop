"use client";

import React from "react";
import RolesManager from "../../components/RolesManager";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const RolesPage = () => {
  const { data: session } = useSession();

  if (!session) {
    redirect("/");
  }
  return <RolesManager />;
};

export default RolesPage;
