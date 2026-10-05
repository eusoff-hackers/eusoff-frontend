"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { AlertTriangle, Check, Copy, KeyRound } from "lucide-react";

import { adminApi, useAdminMutation, useReplaceUser } from "@/src/app/admin/api";
import { GenderTag, NeverBadge, NumberChip, Segmented, Select } from "@/src/app/admin/components/ui";
import type { AdminUser, AdminUserPatch, Breakdown, Gender } from "@/src/app/admin/types";
import { formatSgt } from "@/src/app/lib/time";

const BREAKDOWN_FIELDS: { key: keyof Breakdown; label: string; hint: string }[] = [
  { key: "finalCut2526", label: "Final cut 25/26", hint: "Sports in last year's final cut" },
  { key: "firstCut2627", label: "First cut 26/27", hint: "Sports in this year's first cut" },
  { key: "captain", label: "Captaincy", hint: "Teams captained" },
  { key: "adjustment", label: "Adjustment", hint: "Manual +/-, can be negative" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 border-t border-hairline pt-5">
      <h3 className="eyebrow">{title}</h3>
      {children}
    </section>
  );
}

const toNum = (v: string) => (v.trim() === "" || Number.isNaN(Number(v)) ? 0 : Number(v));

/** Shown first when a resident has no gender: they can't bid or be assigned until it's set. */
function GenderFix({ user }: { user: AdminUser }) {
  const replaceUser = useReplaceUser();
  const [gender, setGender] = useState<Gender | "">("");
  const save = useAdminMutation(adminApi.patchUser, {
    success: u => `Gender set to ${u.gender} for ${u.name}`,
    onData: replaceUser,
  });
  return (
    <section className="rounded-2xl border border-warn/40 bg-warn/[0.07] p-4" aria-labelledby="gender-fix-title">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warn" strokeWidth={1.5} aria-hidden />
        <div className="min-w-0 flex-1">
          <p id="gender-fix-title" className="font-medium text-heading">
            Gender unknown
          </p>
          <p className="mt-0.5 text-sm text-silver">
            This resident can&apos;t bid or be given a number until their gender is set. Quotas are per gender.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Segmented<Gender | "">
              label="Gender"
              value={gender}
              onChange={setGender}
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
              ]}
            />
            <Button
              size="sm"
              disabled={!gender || save.isPending}
              onClick={() => gender && save.mutate({ id: user._id, body: { gender } })}
            >
              {save.isPending ? "Saving" : "Set gender"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResidentForm({ user }: { user: AdminUser }) {
  const replaceUser = useReplaceUser();
  const { toast } = useToast();

  const [breakdown, setBreakdown] = useState<Record<keyof Breakdown, string>>({
    finalCut2526: String(user.breakdown?.finalCut2526 ?? 0),
    firstCut2627: String(user.breakdown?.firstCut2627 ?? 0),
    captain: String(user.breakdown?.captain ?? 0),
    adjustment: String(user.breakdown?.adjustment ?? 0),
  });
  const [details, setDetails] = useState({
    name: user.name ?? "",
    room: user.room ?? "",
    gender: (user.gender ?? "") as Gender | "",
    round: String(user.round ?? ""),
    year: String(user.year ?? ""),
    email: user.email ?? "",
  });
  const [assignNumber, setAssignNumber] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [password, setPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const total = BREAKDOWN_FIELDS.reduce((sum, f) => sum + toNum(breakdown[f.key]), 0);

  const buildPatch = (): AdminUserPatch => {
    const patch: AdminUserPatch = {};
    const nextBreakdown: Breakdown = {
      finalCut2526: toNum(breakdown.finalCut2526),
      firstCut2627: toNum(breakdown.firstCut2627),
      captain: toNum(breakdown.captain),
      adjustment: toNum(breakdown.adjustment),
    };
    if (BREAKDOWN_FIELDS.some(f => nextBreakdown[f.key] !== (user.breakdown?.[f.key] ?? 0))) {
      patch.breakdown = nextBreakdown;
    }
    if (details.name.trim() !== (user.name ?? "")) patch.name = details.name.trim();
    if (details.room.trim() !== (user.room ?? "")) patch.room = details.room.trim();
    if (details.gender && details.gender !== user.gender) patch.gender = details.gender;
    if (details.email.trim() !== (user.email ?? "")) patch.email = details.email.trim();
    if (toNum(details.round) !== user.round) patch.round = toNum(details.round);
    if (details.year.trim() !== "" && toNum(details.year) !== user.year) patch.year = toNum(details.year);
    return patch;
  };
  const patch = buildPatch();
  const dirty = Object.keys(patch).length > 0;

  const save = useAdminMutation(adminApi.patchUser, { success: "Resident updated", onData: replaceUser });
  const allocate = useAdminMutation(adminApi.allocate, {
    success: u => `Assigned ${u.jersey} to ${u.name}`,
    onData: u => {
      replaceUser(u);
      setAssignNumber("");
    },
  });
  const unallocate = useAdminMutation(adminApi.unallocate, {
    success: "Number removed",
    onData: u => {
      replaceUser(u);
      setConfirmRemove(false);
    },
  });
  const reset = useAdminMutation(adminApi.resetPassword, {
    success: "New password generated",
    onData: d => setPassword(d.password),
  });

  const assignValue = Number(assignNumber);
  const assignValid =
    assignNumber.trim() !== "" && Number.isInteger(assignValue) && assignValue >= 0 && assignValue <= 99;

  const copyPassword = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        variant: "destructive",
        title: "Couldn't copy",
        description: "Select the password and copy it manually.",
      });
    }
  };

  const bidsByRound = [...user.bids]
    .sort((a, b) => a.round - b.round || a.priority - b.priority)
    .reduce<Record<number, number[]>>((acc, b) => {
      (acc[b.round] ??= []).push(b.number);
      return acc;
    }, {});

  return (
    <>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pb-8 sm:px-6">
        {!user.gender && <GenderFix key={`g-${user._id}`} user={user} />}

        {/* Allocation */}
        <section className="rounded-2xl bg-raised p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Jersey number</p>
              {user.isAllocated && user.jersey != null ? (
                <p className="stat mt-3 text-[3.5rem]">{user.jersey}</p>
              ) : (
                <p className="mt-3 text-lg text-silver">Not allocated</p>
              )}
              {user.allocatedRound != null && (
                <p className="mt-1 text-xs text-faint">Allocated in round {user.allocatedRound}</p>
              )}
            </div>
            {user.isAllocated &&
              (confirmRemove ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={unallocate.isPending}
                    onClick={() => unallocate.mutate(user._id)}
                  >
                    Remove {user.jersey}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmRemove(false)}>
                    Keep
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setConfirmRemove(true)}>
                  Remove number
                </Button>
              ))}
          </div>
          <form
            className="mt-4 flex items-end gap-2"
            onSubmit={e => {
              e.preventDefault();
              if (assignValid) allocate.mutate({ id: user._id, number: assignValue });
            }}
          >
            <div className="min-w-0 flex-1 space-y-1.5">
              <Label htmlFor="assign-number" className="text-xs">
                {user.isAllocated ? "Reassign to number" : "Assign a number manually"}
              </Label>
              <Input
                id="assign-number"
                inputMode="numeric"
                type="number"
                min={0}
                max={99}
                value={assignNumber}
                onChange={e => setAssignNumber(e.target.value)}
                placeholder="0 to 99"
                disabled={!user.gender}
              />
            </div>
            <Button type="submit" disabled={!assignValid || allocate.isPending || !user.gender}>
              Assign
            </Button>
          </form>
        </section>

        <form
          id="resident-form"
          onSubmit={e => {
            e.preventDefault();
            if (dirty) save.mutate({ id: user._id, body: patch });
          }}
          className="space-y-5"
        >
          <Section title="Points">
            <div className="grid grid-cols-2 gap-3">
              {BREAKDOWN_FIELDS.map(f => (
                <div key={f.key} className="min-w-0 space-y-1.5">
                  <Label htmlFor={`bd-${f.key}`}>{f.label}</Label>
                  <Input
                    id={`bd-${f.key}`}
                    type="number"
                    inputMode="numeric"
                    step={1}
                    min={f.key === "adjustment" ? undefined : 0}
                    value={breakdown[f.key]}
                    onChange={e => setBreakdown(b => ({ ...b, [f.key]: e.target.value }))}
                    aria-describedby={`bd-${f.key}-hint`}
                  />
                  <p id={`bd-${f.key}-hint`} className="text-xs text-faint">
                    {f.hint}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between rounded-xl bg-raised px-4 py-3">
              <span className="text-sm text-silver">Total points</span>
              <span className="text-2xl font-medium tabular-nums text-lavender" aria-live="polite">
                {total}
                {total !== user.points && (
                  <span className="ml-2 text-xs font-normal text-silver">was {user.points}</span>
                )}
              </span>
            </div>
          </Section>

          <Section title="Details">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="r-name">Name</Label>
                <Input
                  id="r-name"
                  value={details.name}
                  onChange={e => setDetails(d => ({ ...d, name: e.target.value }))}
                />
              </div>
              <div className="min-w-0 space-y-1.5">
                <Label htmlFor="r-room">Room</Label>
                <Input
                  id="r-room"
                  value={details.room}
                  onChange={e => setDetails(d => ({ ...d, room: e.target.value }))}
                />
              </div>
              <div className="min-w-0 space-y-1.5">
                <Label htmlFor="r-gender">Gender</Label>
                <Select
                  id="r-gender"
                  value={details.gender}
                  onChange={e => setDetails(d => ({ ...d, gender: e.target.value as Gender | "" }))}
                >
                  {!user.gender && (
                    <option value="" disabled>
                      Not set
                    </option>
                  )}
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Select>
              </div>
              <div className="min-w-0 space-y-1.5">
                <Label htmlFor="r-round">Bidding round</Label>
                <Select
                  id="r-round"
                  value={details.round}
                  onChange={e => setDetails(d => ({ ...d, round: e.target.value }))}
                >
                  {[1, 2, 3, 4].map(r => (
                    <option key={r} value={r}>
                      Round {r}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="min-w-0 space-y-1.5">
                <Label htmlFor="r-year">Year</Label>
                <Input
                  id="r-year"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={details.year}
                  onChange={e => setDetails(d => ({ ...d, year: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="r-email">Email</Label>
                <Input
                  id="r-email"
                  type="email"
                  value={details.email}
                  onChange={e => setDetails(d => ({ ...d, email: e.target.value }))}
                />
              </div>
            </div>
          </Section>
        </form>

        <Section title="Teams">
          {user.teams.length === 0 ? (
            <p className="text-sm text-faint">No teams recorded.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {user.teams.map(t => (
                <span key={t} className="inline-flex h-8 items-center rounded-md border border-hairline px-2.5 text-[13px] text-mist">
                  {t}
                </span>
              ))}
            </div>
          )}
        </Section>

        <Section title="Bids">
          {Object.keys(bidsByRound).length === 0 ? (
            <p className="text-sm text-faint">No bids placed.</p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(bidsByRound).map(([round, numbers]) => (
                <li key={round} className="flex flex-wrap items-center gap-1.5">
                  <span className="w-16 text-[13px] text-silver">Round {round}</span>
                  {numbers.map((n, i) => (
                    <span key={`${n}-${i}`} className="inline-flex items-center gap-1">
                      <span className="text-[10px] tabular-nums text-faint">{i + 1}</span>
                      <NumberChip n={n} highlight={user.jersey === n} />
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Account">
          <p className="text-sm text-silver">
            Last login:{" "}
            {user.lastLogin == null ? (
              <NeverBadge className="ml-1" />
            ) : (
              <span className="tabular-nums text-mist">{formatSgt(user.lastLogin)}</span>
            )}
          </p>
          {password ? (
            <div className="rounded-xl border border-warn/35 bg-warn/[0.07] p-3">
              <p className="text-sm font-medium text-heading">New password. Shown once, copy it now.</p>
              <div className="mt-2 flex items-center gap-2">
                <code className="min-w-0 flex-1 select-all break-all rounded-md bg-recessed px-3 py-2 font-mono text-base text-mist">
                  {password}
                </code>
                <Button type="button" variant="outline" size="icon" onClick={copyPassword} aria-label="Copy password">
                  {copied ? (
                    <Check className="h-4 w-4 text-aqua" strokeWidth={1.5} />
                  ) : (
                    <Copy className="h-4 w-4" strokeWidth={1.5} />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <Button type="button" variant="outline" disabled={reset.isPending} onClick={() => reset.mutate(user._id)}>
              <KeyRound className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              {reset.isPending ? "Generating" : "Reset password"}
            </Button>
          )}
        </Section>
      </div>
      <div className="flex shrink-0 items-center justify-end gap-2 border-t border-hairline bg-recessed px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
        {dirty && <span className="mr-auto text-xs text-warn">Unsaved changes</span>}
        <Button type="submit" form="resident-form" disabled={!dirty || save.isPending}>
          {save.isPending ? "Saving" : "Save changes"}
        </Button>
      </div>
    </>
  );
}

export default function ResidentDrawer({ user, onClose }: { user: AdminUser | null; onClose: () => void }) {
  return (
    <Sheet open={user != null} onOpenChange={open => !open && onClose()}>
      <SheetContent className="gap-0 p-0">
        {user && (
          <>
            <div className="px-4 pb-4 pr-14 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6">
              <SheetTitle className="break-words leading-tight">{user.name}</SheetTitle>
              <SheetDescription className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 tabular-nums">
                <span>{user.username}</span>
                <span>{user.room}</span>
                <GenderTag gender={user.gender} />
                <span>Round {user.round}</span>
                <span className="text-mist">{user.points} pts</span>
                {user.lastLogin == null && <NeverBadge />}
              </SheetDescription>
              {(user.previousResident || (user.captainOf?.length ?? 0) > 0) && (
                <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Recognition">
                  {user.previousResident && (
                    <li className="inline-flex h-6 items-center rounded-[5px] bg-lavender/10 px-2 text-[12px] font-medium text-lavender">
                      Previous resident
                    </li>
                  )}
                  {user.captainOf?.map(t => (
                    <li
                      key={t}
                      className="inline-flex h-6 items-center rounded-[5px] bg-lavender/10 px-2 text-[12px] font-medium text-lavender"
                    >
                      Captain, {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex min-h-0 flex-1 flex-col pt-1">
              <ResidentForm key={`${user._id}-${user.gender}`} user={user} />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
