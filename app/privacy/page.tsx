"use client";

import { useState } from "react";
import { Button, Card, Notice, Shell } from "@/components/ui";
import { clearSession, SESSION_KEY } from "@/lib/session";

export default function PrivacyPage() {
  const [cleared, setCleared] = useState(false);

  return (
    <Shell>
      <h1 className="text-2xl font-bold sm:text-3xl">Your data, precisely</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        This page describes what the prototype actually does today — not what the production design
        intends. Where the two differ, it says so.
      </p>

      <div className="mt-6">
        <Notice title="The short version">
          In guest mode, everything you type stays in this browser&apos;s local storage. The
          recommendation engine runs on your device and does not send those answers to a server.
          Like any website, the app still uses the network to load and can expose ordinary request
          metadata to its host.
        </Notice>
      </div>

      <Card className="mt-6">
        <h2 className="text-lg font-bold">What is collected</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="p-2 text-xs font-bold uppercase text-muted">Data</th>
                <th className="p-2 text-xs font-bold uppercase text-muted">Where it goes</th>
                <th className="p-2 text-xs font-bold uppercase text-muted">Kept for</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-b border-line/50">
                <td className="p-2">Interview answers</td>
                <td className="p-2">This browser only</td>
                <td className="p-2">Until you clear it</td>
              </tr>
              <tr className="border-b border-line/50">
                <td className="p-2">
                  Mission answers, including free text — saved as you type, so a refresh does not
                  lose unfinished writing
                </td>
                <td className="p-2">This browser only</td>
                <td className="p-2">Until you clear it</td>
              </tr>
              <tr className="border-b border-line/50">
                <td className="p-2">Generated routes and plan progress</td>
                <td className="p-2">This browser only</td>
                <td className="p-2">Until you clear it</td>
              </tr>
              <tr className="border-b border-line/50">
                <td className="p-2">Guest session id</td>
                <td className="p-2">This browser only — random, not linked to you</td>
                <td className="p-2">Until you clear it</td>
              </tr>
              <tr>
                <td className="p-2">Analytics, cookies, trackers</td>
                <td className="p-2">
                  None are implemented by the app. A deployment host may still process normal
                  request metadata.
                </td>
                <td className="p-2">—</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          Stored under the key <code className="text-ink">{SESSION_KEY}</code> in localStorage. You
          can inspect it in your browser&apos;s developer tools.
        </p>
      </Card>

      <Card className="mt-4">
        <h2 className="text-lg font-bold">
          The optional path where route metadata can leave the app
        </h2>
        <p className="mt-2 text-sm text-muted">
          The prototype has an <strong className="text-ink">optional</strong> AI explanation layer.
          It is <strong className="text-ink">off unless the operator sets an API key</strong>.
          Local development, automated tests, and CI use the deterministic template explanations
          without a key.
        </p>
        <p className="mt-2 text-sm text-muted">
          If it were enabled, and only when you pressed the button on a route card, the browser
          would send a <strong className="text-ink">catalogue route id</strong> and{" "}
          <strong className="text-ink">fixed reason codes</strong> such as{" "}
          <code className="text-ink">INTEREST_MATCH</code> to the application server. The server
          validates both against its own data, then sends the catalogue route name and fixed reason
          wording to the model provider.
        </p>
        <p className="mt-2 text-sm text-muted">
          Not sent: your free text, your interview answers, your mission answers, your scores, or
          your session id. The route selection could not change either, because the engine has
          already decided it and the endpoint is never given the list.
        </p>
      </Card>

      <Card className="mt-4">
        <h2 className="text-lg font-bold">Two claims that are not the same</h2>
        <div className="mt-3 space-y-3 text-sm">
          <div className="rounded-control border border-line bg-surface2 p-3">
            <p className="font-bold">&ldquo;Not shared with parents or counsellors&rdquo;</p>
            <p className="mt-1 text-muted">
              A permission rule. It says who may read your data — not where your data physically is.
            </p>
          </div>
          <div className="rounded-control border border-mint/40 bg-mint/5 p-3">
            <p className="font-bold">
              &ldquo;Learner answers do not enter the recommendation network path&rdquo;
            </p>
            <p className="mt-1 text-muted">
              A narrower, verifiable claim. The engine reads answers from local storage in the
              browser. The optional AI path sends only the validated catalogue route and fixed
              reasons listed above, never the learner&apos;s answers or free text.
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted">
          Earlier versions of this project&apos;s documentation said &ldquo;chat transcripts never
          leave the student&rdquo; while describing a server-side architecture. That was imprecise
          and has been corrected.
        </p>
      </Card>

      <Card className="mt-4">
        <h2 className="text-lg font-bold">Not implemented yet</h2>
        <ul className="mt-2 space-y-1.5 text-sm text-muted">
          <li>• Accounts, login, and permanent saving</li>
          <li>• Parent and counsellor views, and the consent flow that would gate them</li>
          <li>• Server-side storage, retention policy, and audit logging</li>
          <li>• Data-subject request handling</li>
        </ul>
        <p className="mt-3 text-sm text-muted">
          Those are described as the intended design in the project documentation. None of them
          exists in this prototype, so the app has no account-backed destination for learner
          answers.
        </p>
      </Card>

      <Card className="mt-4 border-coral/30">
        <h2 className="text-lg font-bold">Delete everything</h2>
        <p className="mt-2 text-sm text-muted">
          This removes your guest session from this browser immediately. It cannot be undone, and
          the app keeps no server-side copy of that session. Browser extensions, screenshots and
          device backups are outside this control.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            onClick={() => {
              clearSession();
              setCleared(true);
            }}
            data-testid="delete-data"
          >
            Delete my data
          </Button>
          {cleared ? (
            <span className="text-sm text-mint" role="status">
              Deleted. Starting again will create a new session.
            </span>
          ) : null}
        </div>
      </Card>

      <div className="mt-6">
        <Button href="/" variant="secondary">
          ← Back
        </Button>
      </div>
    </Shell>
  );
}
