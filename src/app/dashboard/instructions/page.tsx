import React from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ArrowUpRight,
  Ban,
  Info,
  Shuffle,
  Trophy,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader, Panel } from "@/src/app/components/system";

export const metadata: Metadata = {
  title: "Jersey Bidding Rules · Eusoff Hall",
};

/** Jersey bidding rules (AY26/27): the committee's rules document plus its confirmed clarifications. */

const RULES_DOC =
  "https://docs.google.com/document/d/1Da-5_QC4qO3-yr_Roy8kNu5amV4m99BTDXMeOf9KvuI/edit";

const ROUNDS = [
  { round: 1, who: "Played at least 3 years of IHG", day: "Wed 7 Oct" },
  { round: 2, who: "Played at least 2 years of IHG", day: "Thu 8 Oct" },
  { round: 3, who: "Played at least 1 year of IHG", day: "Fri 9 Oct" },
  { round: 4, who: "Have not played IHG", day: "Sat 10 Oct" },
];

const NO_SHARE = [
  ["Basketball", "M · F"],
  ["Floorball", "M · F"],
  ["Frisbee", "Mixed"],
  ["Handball", "M · F"],
  ["Soccer", "M · F"],
  ["Softball", "Mixed"],
  ["Touch Rugby", "M · F"],
  ["Volleyball", "M · F"],
];

const ALLOCATION_STEPS = [
  {
    icon: Trophy,
    title: "1 · Your ranking",
    body: "Your 1st choice is tried before your 2nd, and so on.",
  },
  {
    icon: Users,
    title: "2 · Points, then seniority",
    body: "Same number at the same rank? More points wins, then the more senior Eusoffian.",
  },
  {
    icon: Shuffle,
    title: "3 · Random tie-break",
    body: "Still tied? The system picks at random. Everyone else moves to their next choice.",
  },
];

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <div className="surface-card px-4 py-3.5">
      <p className="text-[22px] font-medium leading-none tracking-display text-lavender tabular-nums">
        {value}
      </p>
      <p className="mt-1.5 text-[13px] leading-snug text-silver">{label}</p>
    </div>
  );
}

function Rule({
  children,
  strong,
}: {
  children: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <li className="flex gap-2.5">
      <span
        aria-hidden
        className={cn(
          "mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full",
          strong ? "bg-lavender" : "bg-silver/50",
        )}
      />
      <span className={cn(strong && "text-heading")}>{children}</span>
    </li>
  );
}

export default function JerseyRulesPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6 sm:px-6 sm:py-10">
      <PageHeader
        eyebrow="Jersey Bidding 26/27"
        title="How jersey bidding works"
        description="Everything that decides who gets which number. Bid on this site with the username and password you were emailed."
        actions={
          <Link
            href="/dashboard/jersey"
            className={cn(buttonVariants({ variant: "cta" }), "gap-1.5")}
          >
            Go to bidding <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Fact value="4" label="rounds, by years of IHG played" />
        <Fact value="Top 5" label="numbers you rank in order" />
        <Fact value="0–9" label="never shared" />
        <Fact value="3" label="per gender per number, from Round 2" />
      </div>

      <Panel
        title="Rounds"
        description="Each round runs 9am – 9pm, Singapore time. Bid in your round."
      >
        <ol className="grid gap-2.5 sm:grid-cols-2">
          {ROUNDS.map((r) => (
            <li
              key={r.round}
              className="flex items-start gap-3 rounded-xl bg-recessed p-3.5"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-lavender-fill text-sm font-semibold text-on-accent tabular-nums">
                R{r.round}
              </span>
              <span className="min-w-0">
                <span className="block font-medium text-heading">{r.who}</span>
                <span className="block text-[13px] text-silver tabular-nums">
                  {r.day}, 9am – 9pm
                </span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-3 flex gap-3 rounded-xl border border-hairline bg-recessed p-3.5 text-sm text-silver sm:p-4">
          <Info className="mt-0.5 h-[18px] w-[18px] shrink-0" strokeWidth={1.5} aria-hidden />
          <span>Didn&apos;t get a number in your round? You can bid again in the later
          rounds.</span>
        </p>
      </Panel>

      <Panel
        title="Bidding points"
        description="Points decide between people who rank the same number at the same position."
      >
        <ul className="space-y-2 text-[15px]">
          <Rule strong>Captain this year: 1 point</Rule>
          <Rule strong>Previous year final cut: 1 point for each sport</Rule>
          <Rule strong>
            Made it through the first cut this year: 1 point for each sport
          </Rule>
        </ul>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          <div className="rounded-xl bg-recessed p-3.5 text-[14px] leading-relaxed">
            <p className="mb-1 font-medium text-heading">
              Amy · <span className="text-lavender">3 points</span> · Round 4
            </p>
            Year 3, never played IHG and no final cut last year. Made the first
            cut for 3 sports this year.
          </div>
          <div className="rounded-xl bg-recessed p-3.5 text-[14px] leading-relaxed">
            <p className="mb-1 font-medium text-heading">
              John · <span className="text-lavender">9 points</span> · Round 3
            </p>
            Year 2, played IHG last year with final cut in 3 sports, captain
            this year, first cut in 5 sports: 3 + 1 + 5.
          </div>
        </div>
      </Panel>

      <Panel title="Sharing numbers">
        <ul className="space-y-2.5 text-[15px]">
          <Rule strong>
            Round 1 numbers are never shared. Only one person of each gender
            gets a number in Round 1, and that number stays closed to that
            gender in every later round.
          </Rule>
          <Rule strong>Numbers 0 – 9 are never shared.</Rule>
          <Rule>
            From Round 2, numbers are shared when more than one person bids for
            them: up to 3 people per gender per number.
          </Rule>
          <Rule>
            Once a number&apos;s quota is full it closes, and later rounds
            can&apos;t bid for it. For example, if number 10 fills up in Round
            2, Rounds 3 and 4 can&apos;t pick 10.
          </Rule>
        </ul>
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-2 text-[13px] font-medium text-heading">
            <Ban className="h-4 w-4 text-danger" aria-hidden /> No sharing
            within these team sports
          </p>
          <ul className="flex flex-wrap gap-2">
            {NO_SHARE.map(([sport, who]) => (
              <li
                key={sport}
                className="rounded-full border border-hairline bg-recessed px-3 py-1.5 text-[13px]"
              >
                <span className="text-heading">{sport}</span>{" "}
                <span className="text-silver">· {who}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[13px] text-silver">
            Teammates on these teams can&apos;t hold the same number. Frisbee
            and Softball are mixed, so this applies across genders too.
          </p>
        </div>
      </Panel>

      <Panel title="How bids are allocated">
        <div className="grid gap-2.5 sm:grid-cols-3">
          {ALLOCATION_STEPS.map((s) => (
            <div key={s.title} className="rounded-xl bg-recessed p-3.5">
              <s.icon
                className="mb-2 h-5 w-5 text-lavender"
                strokeWidth={1.75}
                aria-hidden
              />
              <p className="font-medium text-heading">{s.title}</p>
              <p className="mt-1 text-[13px] leading-snug text-silver">
                {s.body}
              </p>
            </div>
          ))}
        </div>
        <ul className="mt-4 space-y-2.5 text-[15px]">
          <Rule strong>
            It&apos;s not first come, first served. Numbers are allocated after
            each round closes.
          </Rule>
          <Rule>
            Your most recent submission before the round closes is final. You
            can change your picks until then.
          </Rule>
          <Rule>
            Example: Tom, Jerry and Moose all put 20 as their top choice with
            the same points. The most senior gets 20; if they&apos;re equally
            senior, one is picked at random. The others get their next choices
            if possible.
          </Rule>
        </ul>
      </Panel>

      <Panel title="What you can see while bidding">
        <ul className="space-y-2.5 text-[15px]">
          <Rule>
            How many people are bidding for each number, and whether it&apos;s
            still available to you.
          </Rule>
          <Rule>
            For each of your sports, the numbers your teammates are bidding for.
            Everyone is shown only by room number (PDPA).
          </Rule>
        </ul>
      </Panel>

      <Panel title="After the rounds">
        <ul className="space-y-2.5 text-[15px]">
          <Rule>
            If there aren&apos;t enough numbers in Round 4, numbers from Round 3
            can be shared, still up to 3 per gender.
          </Rule>
          <Rule>
            After Round 4, anyone still without a number is assigned an
            available one.
          </Rule>
        </ul>
      </Panel>

      <p className="px-1 text-center text-[13px] text-silver">
        Questions or a discrepancy in your points? Message @kkewinee or
        @thexianguy.{" "}
        <a
          href={RULES_DOC}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-0.5 text-heading underline decoration-hairline underline-offset-4 hover:decoration-current"
        >
          Original rules document{" "}
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </a>
      </p>
    </div>
  );
}
