"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import missionsData from "@/data/missions.json";
import { Button, Card, Notice, Shell } from "@/components/ui";
import { checkAll } from "@/lib/safety";
import { loadOrCreate, saveSession, type GuestSession } from "@/lib/session";
import SafetyPause from "@/components/SafetyPause";

const mission = missionsData.missions[0];

export default function MissionPage() {
  const router = useRouter();
  const [session, setSession] = useState<GuestSession | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [safety, setSafety] = useState(false);

  useEffect(() => {
    const s = loadOrCreate();
    setSession(s);
    if (s.mission?.missionId === mission.id) setAnswers(s.mission.answers);
  }, []);

  if (!session) {
    return (
      <Shell step={2}>
        <p className="text-muted">Loading your session…</p>
      </Shell>
    );
  }

  if (safety) return <SafetyPause onDismiss={() => setSafety(false)} />;

  const setText = (id: string, v: string) => setAnswers((a) => ({ ...a, [id]: v }));

  const toggleMulti = (id: string, value: string, max: number) => {
    setAnswers((a) => {
      const cur = Array.isArray(a[id]) ? (a[id] as string[]) : [];
      if (cur.includes(value)) return { ...a, [id]: cur.filter((v) => v !== value) };
      if (cur.length >= max) return a;
      return { ...a, [id]: [...cur, value] };
    });
  };

  const errors = validate(answers);
  const alreadyDone = session.mission?.completed === true;

  const submit = () => {
    if (errors.length > 0) {
      setShowErrors(true);
      document.getElementById("mission-errors")?.focus();
      return;
    }
    const texts = mission.steps
      .filter((s) => s.type === "text")
      .map((s) => answers[s.id] as string | undefined);
    if (checkAll(texts).triggered) {
      const next = { ...session, safetyTriggered: true };
      setSession(next);
      saveSession(next);
      setSafety(true);
      return;
    }
    const next: GuestSession = {
      ...session,
      mission: { missionId: mission.id, answers, completed: true },
    };
    setSession(next);
    saveSession(next);
    router.push("/routes");
  };

  return (
    <Shell step={2}>
      <div className="mb-6">
        <p className="text-[11px] font-bold tracking-widest text-mint">
          MISSION · {mission.minutes} MIN
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{mission.title}</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">{mission.objective}</p>
      </div>

      <div className="mb-6">
        <Notice title="Why this exists">
          Saying you like something and doing it are different kinds of evidence. Your choices here
          are scored separately from the interview — if they disagree, you will be shown the
          disagreement rather than have it averaged away.
        </Notice>
      </div>

      {alreadyDone ? (
        <div className="mb-5">
          <Notice title="You already completed this mission">
            Your previous answers are loaded below. Editing them and submitting again will change
            your routes.
          </Notice>
        </div>
      ) : null}

      <Card className="mb-5 border-indigo/30">
        <p className="text-sm text-muted">{mission.prompt}</p>
      </Card>

      <div className="space-y-4">
        {mission.steps.map((step, i) => (
          <Card key={step.id}>
            <fieldset>
              <legend className="text-sm font-semibold">
                <span className="mr-2 text-muted">{i + 1}.</span>
                {step.label}
                {step.required ? <span className="ml-1 text-coral">*</span> : null}
              </legend>
              {step.help ? <p className="mt-1 text-xs text-muted">{step.help}</p> : null}

              {step.type === "text" ? (
                <>
                  <textarea
                    data-testid={`m-${step.id}`}
                    rows={3}
                    placeholder={step.placeholder}
                    value={(answers[step.id] as string) ?? ""}
                    onChange={(e) => setText(step.id, e.target.value)}
                    className="mt-3 w-full rounded-control border border-line bg-surface2 px-3 py-2 text-sm text-ink placeholder:text-muted/60"
                  />
                  <p className="mt-1 text-xs text-muted">
                    {((answers[step.id] as string) ?? "").trim().length} / {step.minLength ?? 0}{" "}
                    characters minimum
                  </p>
                </>
              ) : null}

              {step.type === "multi" ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {step.options?.map((o) => {
                    const cur = Array.isArray(answers[step.id]) ? (answers[step.id] as string[]) : [];
                    const active = cur.includes(o.value);
                    return (
                      <button
                        key={o.value}
                        type="button"
                        aria-pressed={active}
                        data-testid={`m-${step.id}-${o.value}`}
                        onClick={() => toggleMulti(step.id, o.value, step.maxSelected ?? 4)}
                        className={[
                          "rounded-control border px-3 py-2 text-left text-xs font-semibold transition",
                          active
                            ? "border-mint bg-mint/10 text-ink"
                            : "border-line bg-surface2 text-muted hover:border-muted hover:text-ink",
                        ].join(" ")}
                      >
                        <span aria-hidden className="mr-2">
                          {active ? "☑" : "☐"}
                        </span>
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {step.type === "single" ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {step.options?.map((o) => {
                    const active = answers[step.id] === o.value;
                    return (
                      <button
                        key={o.value}
                        type="button"
                        aria-pressed={active}
                        data-testid={`m-${step.id}-${o.value}`}
                        onClick={() => setText(step.id, o.value)}
                        className={[
                          "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                          active
                            ? "border-mint bg-mint text-mintInk"
                            : "border-line bg-surface2 text-muted hover:border-muted hover:text-ink",
                        ].join(" ")}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </fieldset>
          </Card>
        ))}
      </div>

      <div id="mission-errors" tabIndex={-1} aria-live="assertive" className="mt-6 focus:outline-none">
        {showErrors && errors.length > 0 ? (
          <Notice tone="warning" title="Not finished yet">
            <ul className="list-inside list-disc">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </Notice>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button onClick={submit} data-testid="mission-submit">
          Mark mission complete →
        </Button>
        <Button href="/interview" variant="secondary">
          ← Back to interview
        </Button>
      </div>
    </Shell>
  );
}

function validate(answers: Record<string, string | string[]>): string[] {
  const errors: string[] = [];
  for (const step of mission.steps) {
    if (!step.required) continue;
    const v = answers[step.id];
    if (step.type === "text") {
      const text = ((v as string) ?? "").trim();
      if (text.length < (step.minLength ?? 1)) {
        errors.push(`“${step.label}” needs at least ${step.minLength ?? 1} characters.`);
      }
    }
    if (step.type === "multi") {
      const arr = Array.isArray(v) ? v : [];
      if (arr.length < (step.minSelected ?? 1)) {
        errors.push(`Choose at least ${step.minSelected ?? 1} options for “${step.label}”.`);
      }
    }
    if (step.type === "single" && !v) {
      errors.push(`Choose an answer for “${step.label}”.`);
    }
  }
  return errors;
}
