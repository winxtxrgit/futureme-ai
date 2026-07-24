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
          In guest mode, everything you type stays in this browser&apos;s local storage. No server
          receives it, because the recommendation engine runs as JavaScript on your own device.
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
                <td className="p-2">Mission answers, including free text</td>
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
                <td className="p-2">None. There are none.</td>
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
        <h2 className="text-lg font-bold">The one case where data leaves your device</h2>
        <p className="mt-2 text-sm text-muted">
          The prototype has an <strong className="text-ink">optional</strong> AI explanation layer.
          It is <strong className="text-ink">off unless the operator sets an API key</strong>, and
          this demo deployment does not set one — so the deterministic template explanations are
          what you see.
        </p>
        <p className="mt-2 text-sm text-muted">
          If it were enabled, your scored profile and route names would be sent to the model
          provider to be rewritten more warmly. Your free-text answers would not be included. The
          route selection would not change, because the engine has already decided it.
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
            <p className="font-bold">&ldquo;Never transmitted outside this device&rdquo;</p>
            <p className="mt-1 text-muted">
              A much stronger, physical claim. It is true of guest mode in this prototype today,
              because nothing is sent anywhere. It would stop being true the moment accounts,
              counsellor sharing, or the AI layer are switched on.
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
          exists in this prototype, so no data has anywhere to go.
        </p>
      </Card>

      <Card className="mt-4 border-coral/30">
        <h2 className="text-lg font-bold">Delete everything</h2>
        <p className="mt-2 text-sm text-muted">
          This removes your guest session from this browser immediately. It cannot be undone, and
          there is no copy anywhere else.
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
