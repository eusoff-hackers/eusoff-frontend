"use client";

import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import { api, errorMessage, errorStatus, homeFor, toUser } from "@/src/app/lib/api";
import { selectUser, setUser } from "@/src/app/redux/Resources/userSlice";

export default function LoginForm() {
  const user = useSelector(selectUser);
  const router = useRouter();
  const dispatch = useDispatch();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user !== null) router.push(homeFor(user));
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await api.post("/user/login", { credentials: { username: username.trim(), password } });
      if (response.data.success) {
        const newUser = toUser(response.data.data.user);
        dispatch(setUser(newUser));
        router.replace(homeFor(newUser));
        return;
      }
      setError("Sign in failed. Please try again.");
    } catch (err) {
      setError(errorStatus(err) === 401 ? "That username and password don't match." : errorMessage(err));
      console.error("Error during login", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl bg-raised p-6 [box-shadow:var(--pop-shadow)] sm:p-10">
      <h2 className="text-[1.75rem] font-bold tracking-[-0.015em] text-heading">Login</h2>

      <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-[15px] font-normal">
            Username
          </Label>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            autoCapitalize="characters"
            spellCheck={false}
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Please insert your matric number"
            aria-invalid={!!error || undefined}
            aria-describedby={error ? "login-error" : undefined}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-[15px] font-normal">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Please insert your password"
              className="pr-12 tracking-wide"
              aria-invalid={!!error || undefined}
              aria-describedby={error ? "login-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute right-0.5 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-silver transition-colors hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua"
            >
              {showPassword ? (
                <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.5} />
              ) : (
                <Eye className="h-[18px] w-[18px]" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {error && (
          <p id="login-error" role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" variant="cta" size="lg" className="h-[52px] w-full text-base" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            <LogIn className="h-5 w-5" strokeWidth={2} aria-hidden />
          )}
          {submitting ? "Signing in" : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
