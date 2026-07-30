"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Notice, Shell } from "@/components/ui";
import {
  MISSIONS as MISSION_LIST,
  missionById,
  selectMission,
  type MissionDef,
  type MissionRationale,
} from "@/lib/mission";
import { checkAll } from "@/lib/safety";
import { loadOrCreate, saveSession, type GuestSession } from "@/lib/session";
import { usePreferences } from "@/components/PreferencesProvider";
import { format, localised } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";
import type { Language } from "@/lib/preferences";
import type { Localised } from "@/lib/decision-engine/types";

import SafetyPause from "@/components/SafetyPause";

type Answers = Record<string, string | string[]>;

/** Long enough not to write on every keystroke, short enough to beat a refresh. */
const DRAFT_SAVE_MS = 400;

export default function MissionPage() {
  const { t, lang } = usePreferences();
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
          {format(t.mission.eyebrow, { min: mission.minutes })}
        </p>
        <h1
          className="mt-2 text-2xl font-bold sm:text-3xl"
          data-testid="mission-title"
          data-mission-id={mission.id}
        >
          {localised(mission.title, lang)}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">{localised(mission.objective, lang)}</p>
      </div>

      <div className="mb-5">
        <Notice title={t.mission.whyThisOneTitle}>
          <p data-testid="mission-rationale">
            {isLearnerChoice
              ? t.engine.missionRationale.learnerChoice
              : renderRationale(suggestion.rationale, lang, t)}
          </p>
          <p className="mt-2">{t.mission.whyThisOneRule}</p>
        </Notice>
      </div>

      <div className="mb-6">
        <Notice title={t.mission.whyExistsTitle}>{t.mission.whyExistsBody}</Notice>
      </div>

      {alreadyDone ? (
        <div className="mb-5">
          <Notice title={t.mission.alreadyDoneTitle}>{t.mission.alreadyDoneBody}</Notice>
        </div>
      ) : null}

      <Card className="mb-5 border-indigo/30">
        <p className="text-sm text-muted">{localised(mission.prompt, lang)}</p>
      </Card>

      <div className="space-y-4">
        {mission.steps.map((step, i) => (
          <Card key={step.id}>
            <fieldset>
              <legend className="text-sm font-semibold">
                <span className="mr-2 text-muted">{i + 1}.</span>
                {localised(step.label as Localised, lang)}
                {step.required ? <span className="ml-1 text-coral">*</span> : null}
              </legend>
              {step.help ? (
                <p className="mt-1 text-xs text-muted">
                  {localised(step.help as Localised, lang)}
                </p>
              ) : null}

              {step.type === "text" ? (
                <>
                  <textarea
                    data-testid={`m-${step.id}`}
                    rows={3}
                    placeholder={
                      step.placeholder ? localised(step.placeholder as Localised, lang) : undefined
                    }
                    value={(answers[step.id] as string) ?? ""}
                    onChange={(e) => setValue(step.id, e.target.value)}
                    className="mt-3 w-full rounded-control border border-line bg-surface2 px-3 py-2 text-sm text-ink placeholder:text-muted/80"
                  />
                  <p className="mt-1 text-xs text-muted">
                    {format(t.mission.charactersMinimum, {
                      count: ((answers[step.id] as string) ?? "").trim().length,
                      min: step.minLength ?? 0,
                    })}
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
                        {localised(o.label as Localised, lang)}
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
                        {localised(o.label as Localised, lang)}
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
        {draftSaved ? t.mission.draftSaved : t.mission.draftHint}
      </p>

      <div id="mission-errors" tabIndex={-1} aria-live="assertive" className="mt-6 focus:outline-none">
        {showErrors && errors.length > 0 ? (
          <Notice tone="warning" title={t.mission.errorsTitle}>
            <ul className="list-inside list-disc">
              {errors.map((e) => (
                <li key={errorKey(e)}>{renderError(e, lang, t)}</li>
              ))}
            </ul>
          </Notice>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button onClick={submit} data-testid="mission-submit">
          {t.mission.submit}
        </Button>
        <Button href="/interview" variant="secondary">
          {t.mission.backToInterview}
        </Button>
      </div>

      <details className="mt-8 rounded-card border border-line bg-surface p-5" data-testid="mission-alternatives">
        <summary className="cursor-pointer text-sm font-bold">
          {t.mission.alternativesSummary}
        </summary>
        <p className="mt-3 text-sm text-muted">
          {isLearnerChoice
            ? format(t.mission.alternativesLearnerChoice, {
                suggested: localised(suggestion.mission.title, lang),
              })
            : t.mission.alternativesDefault}
          {hasDraft ? t.mission.alternativesDraftWarning : ""}
        </p>
        <ul className="mt-4 space-y-3">
          {alternatives.map((alt) => (
            <li key={alt.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{localised(alt.title, lang)}</p>
                <p className="text-xs text-muted">{localised(alt.objective, lang)}</p>
              </div>
              <Button
                variant="secondary"
                onClick={() => switchMission(alt.id)}
                data-testid={`switch-${alt.id}`}
              >
                {t.mission.doThisInstead}
              </Button>
            </li>
          ))}
        </ul>
      </details>
    </Shell>
  );
}

/** Turns the selector's rationale code into a sentence in the active language. */
function renderRationale(r: MissionRationale, lang: Language, t: Dictionary): string {
  const copy = t.engine.missionRationale;
  switch (r.kind) {
    case "learner-choice":
      return copy.learnerChoice;
    case "default-too-few":
      return copy.defaultTooFew;
    case "default-too-even":
      return copy.defaultTooEven;
    case "default-no-match":
      return copy.defaultNoMatch;
    case "matched": {
      const mission = MISSION_LIST.find((m) => m.id === r.missionId);
      const rank =
        r.rank === 0
          ? copy.rankStrongest
          : format(copy.rankOther, { ordinal: r.rank + 1 });
      return format(copy.matched, {
        because: mission ? localised(mission.chosenBecause, lang) : "",
        dimension: t.engine.dimensions[r.dimension],
        rank,
      });
    }
  }
}

/** A validation failure, as data — the wording is chosen when it is rendered. */
type MissionError =
  | { kind: "text"; label: Localised; min: number }
  | { kind: "multi"; label: Localised; min: number }
  | { kind: "single"; label: Localised };

function validate(mission: MissionDef, answers: Answers): MissionError[] {
  const errors: MissionError[] = [];
  for (const step of mission.steps) {
    if (!step.required) continue;
    const v = answers[step.id];
    const label = step.label as Localised;
    if (step.type === "text") {
      const text = ((v as string) ?? "").trim();
      if (text.length < (step.minLength ?? 1)) {
        errors.push({ kind: "text", label, min: step.minLength ?? 1 });
      }
    }
    if (step.type === "multi") {
      const arr = Array.isArray(v) ? v : [];
      if (arr.length < (step.minSelected ?? 1)) {
        errors.push({ kind: "multi", label, min: step.minSelected ?? 1 });
      }
    }
    if (step.type === "single" && !v) {
      errors.push({ kind: "single", label });
    }
  }
  return errors;
}

function errorKey(e: MissionError): string {
  return `${e.kind}:${e.label.en}`;
}

function renderError(e: MissionError, lang: Language, t: Dictionary): string {
  const label = localised(e.label, lang);
  if (e.kind === "text") return format(t.mission.errorTextTooShort, { label, min: e.min });
  if (e.kind === "multi") return format(t.mission.errorTooFewOptions, { label, min: e.min });
  return format(t.mission.errorNoChoice, { label });
}
