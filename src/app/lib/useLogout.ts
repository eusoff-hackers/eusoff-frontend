"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import { api } from "@/src/app/lib/api";
import { removeUser } from "@/src/app/redux/Resources/userSlice";

/** Clears local session state, tells the server, and returns to the login page. */
export function useLogout() {
  const dispatch = useDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  return async () => {
    dispatch(removeUser());
    localStorage.clear();
    queryClient.clear();
    try {
      await api.post("/user/logout");
    } catch {
      console.error("Logout error");
    }
    router.push("/");
  };
}
