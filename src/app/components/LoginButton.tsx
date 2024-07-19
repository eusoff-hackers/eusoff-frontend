"use client";

import React from "react";

import { useRouter } from "next/navigation";

export default function LoginButton() {
  const route = useRouter();

  return (
    <button onClick={() => route.push("/login")} className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
      Login
    </button>
  );
}
