import React from "react";

import { Wordmark } from "@/src/app/components/Brand";
import LoginForm from "@/src/app/components/LoginForm";

export default function Home() {
  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden">
      <header className="mx-auto flex w-full max-w-6xl items-center px-4 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8">
        <Wordmark />
      </header>

      <div className="mx-auto grid w-full max-w-6xl flex-1 content-center gap-10 px-4 py-10 sm:px-8 lg:grid-cols-[1.15fr,1fr] lg:items-center lg:gap-16 lg:py-16">
        <section className="animate-fade-up">
          <p className="eyebrow text-aqua/90">Jersey Bidding 26/27</p>
          <h1 className="display mt-5 text-[2.75rem] sm:text-6xl lg:text-[5.25rem]">
            Pick your
            <br />
            IHG number.
          </h1>
          <p className="mt-6 max-w-[34ch] text-base text-silver sm:text-lg">
            Choose up to five numbers in order. They&apos;re allocated round by round, by choice, then points.
          </p>
          <div className="mt-8 hidden h-px w-40 bg-biolum opacity-70 lg:block" aria-hidden />
        </section>

        <section className="animate-fade-up [animation-delay:80ms]">
          <LoginForm />
        </section>
      </div>

      <footer className="mx-auto w-full max-w-6xl px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-xs text-[#93a19f] sm:px-8">
        Trouble signing in? Contact the jersey committee.
      </footer>
    </main>
  );
}
