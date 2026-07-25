"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Notice, Shell } from "@/components/ui";
import { MISSIONS as MISSION_LIST, missionById, selectMission, type MissionDef } from "@/lib/mission";
import { checkAll } from "@/lib/safety";
import { loadOrCreate, saveSession, type GuestSession } from "@/lib/session";
import SafetyPause from "@/components/SafetyPause";

type Answers = Record<string, string | string[]>;

/** Long enough not to write on every keystroke, short enough to beat a refresh. */
const DRAFT_SAVE_MS = 400;

export default function MissionPage() {
  const router = useRouter();
  const [session, setSession] = useState<GuestSession | null>(null);
  const [missionId, setMissionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [showErrors, setShowErrors] = useState(false);
  const [safety, setSafety] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // Set while the mission is being submitted, so the debounced draft write
  // cannot land after the completed record and quietly undo it.
  const submitting = useRef(false);
  const sessionRef = useRef<GuestSession | null>(null);

  useEffect(() => {
    const s = loadOrCreate();
    sessionRef.current = s;
    setSession(s);
    // A stored mission — finished or half-written — always wins over a fresh
    // selection, otherwise resuming would move the learner to another task.
    const stored = missionById(s.mission?.missionId);
    setMissionId(stored ? stored.id : selectMission(s.interview).mission.id);
    setAnswers(stored ? (s.mission?.answers ?? {}) : {});
  }, []);

  // What the rule would pick from the interview alone. Kept separate from what
  // the learner is actually doing, so an override is never quoted back as its
  // own justification.
  const suggestion = useMemo(
    () => (session ? selectMission(session.interview) : null),
    [session],
  );

  const mission = missionById(missionId) ?? suggestion?.mission ?? null;
  const isLearnerChoice = Boolean(mission && suggestion && mission.id !== suggestion.mission.id);
  const alternatives = mission ? MISSION_LIST.filter((m) => m.id !== mission.id) : [];

  const persistDraft = useCallback((nextAnswers: Answers, nextMissionId: string) => {
    const current = sessionRef.current;
    if (submitting.current || !current) return;
    const next: GuestSession = {
      ...current,
      mission: {
        missionId: nextMissionId,
        answers: nextAnswers,
        completed: current.mission?.missionId === nextMissionId && current.mission.completed,
      },
    };
    sessionRef.current = next;
    setSession(next);
    saveSession(next);
    setDraftSaved(true);
  }, []);

  // Debounced autosave. Unfinished work surviving a refresh is the point —
  // a student who loses a half-written answer does not write it again.
  useEffect(() => {
    if (!session || !missionId) return;
    const timer = setTimeout(() => persistDraft(answers, missionId), DRAFT_SAVE_MS);
    return () => clearTimeout(timer);
  }, [answers, missionId, session, persistDraft]);

  if (!session || !mission || !suggestion) {
    return (
      <Shell step={2}>
        <p className="text-muted">Loading your session…</p>
      </Shell>
    );
  }

  if (safety) return <SafetyPause onDismiss={() => setSafety(false)} />;

  const setValue = (id: string, v: string) => setAnswers((a) => ({ ...a, [id]: v }));

  const toggleMulti = (id: string, value: string, max: number) => {
    setAnswers((a) => {
      const cur = Array.isArray(a[id]) ? (a[id] as string[]) : [];
      if (cur.includes(value)) return { ...a, [id]: cur.filter((v) => v !== value) };
      if (cur.length >= max) return a;
      return { ...a, [id]: [...cur, value] };
    });
  };

  const switchMission = (id: string) => {
    setMissionId(id);
    setAnswers({});
    setShowErrors(false);
    persistDraft({}, id);
  };

  const errors = validate(mission, answers);
  const alreadyDone = session.mission?.completed === true && session.mission.missionId === mission.id;
  const hasDraft = Object.keys(answers).length > 0;

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
      sessionRef.current = next;
      setSession(next);
      saveSession(next);
      setSafety(true);
      return;
    }
    submitting.current = true;
    const next: GuestSession = {
      ...session,
      mission: { missionId: mission.id, answers, completed: true },
    };
    sessionRef.current = next;
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
        <h1
          className="mt-2 text-2xl font-bold sm:text-3xl"
          data-testid="mission-title"
          data-mission-id={mission.id}
        >
          {mission.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">{mission.objective}</p>
      </div>

      <div className="mb-5">
        <Notice title="Why you were given this one">
          <p data-testid="mission-rationale">
            {isLearnerChoice ? "You chose this mission yourself." : suggestion.rationale}
          </p>
          <p className="mt-2">
            The choice is made by a fixed rule in your browser that reads your interview profile —
            not by a model, and not by anything you cannot see.
          </p>
        </Notice>
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
                    onChange={(e) => setValue(step.id, e.target.value)}
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
                        onClick={() => setValue(step.id, o.value)}
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

      <p className="mt-3 text-xs text-muted" aria-live="polite" data-testid="draft-status">
        {draftSaved
          ? "Saved in this browser as you type — a refresh will not lose this."
          : "Answers are saved in this browser as you type."}
      </p>

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

      <details className="mt-8 rounded-card border border-line bg-surface p-5" data-testid="mission-alternatives">
        <summary className="cursor-pointer text-sm font-bold">
          Would you rather do a different mission?
        </summary>
        <p className="mt-3 text-sm text-muted">
          {isLearnerChoice
            ? `The rule would have suggested “${suggestion.mission.title}”. You are doing this one because you picked it.`
            : "You are not stuck with the suggestion. Any of these produces the same kind of evidence."}
          {hasDraft ? " Switching replaces the answers you have written here." : ""}
        </p>
        <ul className="mt-4 space-y-3">
          {alternatives.map((alt) => (
            <li key={alt.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{alt.title}</p>
                <p className="text-xs text-muted">{alt.objective}</p>
              </div>
              <Button
                variant="secondary"
                onClick={() => switchMission(alt.id)}
                data-testid={`switch-${alt.id}`}
              >
                Do this instead
              </Button>
            </li>
          ))}
        </ul>
      </details>
    </Shell>
  );
}

function validate(mission: MissionDef, answers: Answers): string[] {
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
