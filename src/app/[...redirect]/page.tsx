"use client";

import { useEffect } from "react";

import { redirect } from "next/dist/server/api-utils";
import { useRouter } from "next/navigation";

export default function Redirect({ params }: { params: { redirect: string } }) {
  const router = useRouter();
  const validPaths = ["dashboard", "instructions", "profile", "login"];

  // redirect user to login page if it is not a valid path
  useEffect(() => {
    if (validPaths.includes(String(redirect))) {
      router.push(`/${redirect}`);
    } else {
      router.replace(`/`);
    }
  });
}
