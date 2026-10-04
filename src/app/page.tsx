import React from "react";

import Image from "next/image";

import LoginForm from "@/src/app/components/LoginForm";
import ThemeToggle from "@/src/app/components/ThemeToggle";

/** The hall's original login: crest and wordmark beside the sign-in card, on the Eusoff gradient. */
export default function Home() {
  return (
    <main className="login-backdrop relative flex min-h-[100dvh] flex-col">
      <div className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10 sm:right-5">
        <ThemeToggle />
      </div>

      <div className="mx-auto grid w-full max-w-6xl flex-1 content-center items-center gap-8 px-4 py-14 sm:px-8 md:grid-cols-2 md:gap-12 lg:gap-20">
        <section className="flex flex-col items-center text-center md:items-start md:text-left">
          <Image
            src="/eusoff-logo.png"
            alt="Eusoff Hall crest"
            width={480}
            height={553}
            priority
            className="h-auto w-[132px] drop-shadow-[0_6px_14px_rgb(123_30_43/0.18)] sm:w-[168px] lg:w-[208px]"
          />
          <h1 className="mt-3 text-[clamp(2.5rem,1.6rem+4vw,4.75rem)] font-bold leading-[1.02] tracking-[-0.01em] text-band-ink">
            Eusoff Hall
          </h1>
          <p className="mt-1.5 text-[15px] text-band-ink/80 sm:text-base md:pl-[0.15em]">Excellence and Harmony</p>
        </section>

        <section className="w-full max-w-[460px] justify-self-center md:justify-self-end">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
