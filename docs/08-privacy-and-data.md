# 08 · Privacy and Data Flow

[← Roadmap](07-roadmap.md) · [Back to README](../READMEEN.md) · [Next: Source Review →](09-source-review.md)

---

This document describes what the **implemented prototype** does, then separately what the
**planned production design** intends. Where an earlier version of this project's documentation
overstated a privacy property, the correction is recorded here.

---

## Correction to an earlier claim

Earlier documentation stated:

> ~~"Chat transcripts never leave the student."~~

That sentence was imprecise, and it sat next to an architecture diagram showing a FastAPI backend
and a PostgreSQL database. Two different claims were being blurred:

| Claim | What it means | Where it is true |
|---|---|---|
| **"Not shared with parents or counsellors"** | A *permission* rule. It constrains who may read data. It says nothing about where the data physically travels. | This is the production design intent. Nothing enforces it yet, because the sharing features do not exist. |
| **"Learner answers stay on the device"** | A narrower physical claim about interview and mission input. | True of the implemented recommendation path. An enabled explanation request sends a catalogue route id and fixed reason codes, but not the underlying answers. |

The first does not imply the second. A system can faithfully hide a transcript from a parent while
still transmitting it to a server, logging it, and retaining it indefinitely. The corrected wording
appears in the README, in the running app at `/privacy`, and below.

---

## What the prototype actually does

**Learner answers and progress stay in the browser.** The recommendation engine
(`lib/decision-engine/`) is plain TypeScript that executes on the client. There is no network
request in the recommendation path. Loading a hosted web app still creates ordinary requests to
its host, and the optional explanation layer is a separate network path described below.

| Data | Collected? | Where it goes | Retention |
|---|---|---|---|
| Interview Likert answers | Yes | `localStorage` in this browser | Until the user deletes it |
| Interview free text ("something you were proud of") | Yes, optional | `localStorage` only | Until the user deletes it |
| Mission answers, including free text | Yes | `localStorage` only | Until the user deletes it |
| Generated routes and scores | Yes | Recomputed on demand; not stored separately | n/a |
| Selected route and plan check-ins | Yes | `localStorage` only | Until the user deletes it |
| Guest session id | Yes | `localStorage` only — random, not derived from anything about the user | Until the user deletes it |
| Name, email, phone, school | **No** | — | — |
| Analytics, advertising cookies or trackers added by the app | **No** | — | — |
| Normal request metadata such as IP address | Not collected by FutureMe application code | A deployment host may process or log it when serving pages or `/api/explain` | Governed by the host's configuration |
| Server-side logs of answers | **No** — there is no server in this path | — | — |

Storage key: `futureme.guest.v1`. It is inspectable in browser developer tools, which is
deliberate — a privacy claim a user can verify themselves is worth more than one they must trust.

**Writes happen as you type.** Mission answers are autosaved on a short debounce so a refresh does
not discard unfinished writing. This is a usability decision with a privacy consequence worth
stating: a half-written answer is on disk in this browser from the moment it is typed, not only
once it is submitted. It is covered by the same delete control.

**Reads are treated as untrusted.** localStorage is writable by the user, by extensions, and by
anything that has run on this origin. The session is therefore not parsed and used — it is rebuilt
field by field against the seed data on every read. Question ids, Likert values, context options,
mission steps, option values and route ids are all checked against what the app actually offers;
anything unrecognised is dropped rather than passed to the scorer, collections are capped, and a
container that cannot be trusted at all resets to a clean session. The learner is told once when
something was discarded.

This is a correctness property before it is a security one: an out-of-range Likert value silently
reaching the scorer would produce a recommendation nobody could explain.

**Deletion.** `/privacy` has a *Delete my data* control that removes the FutureMe session key
immediately. The app creates no server-side copy of that session. Browser extensions, screenshots,
device backups and deployment-host request logs are outside that control.

**Identity and consent.** Guest mode does not ask for a name, email, phone number or school.
Learners can still type identifying information into optional free-text fields, so anonymity
cannot be guaranteed. Account and counsellor-sharing flows are not built; any future pilot needs
an appropriate consent and legal review rather than relying on guest mode alone.

---

## The one path where data could leave the device

There is an optional LLM explanation layer at `app/api/explain/route.ts`.

- It is **disabled unless the operator sets `ANTHROPIC_API_KEY`**.
- When disabled it returns `{ source: "fallback" }` and the app uses deterministic template text. Behaviour is identical apart from wording.
- If enabled, the browser request contains a **catalogue route id and fixed reason codes**. The
  server validates both, resolves their server-owned wording, and sends no learner answers or free
  text to the provider.
- It cannot change which routes were selected. The engine has already decided by the time this is called.
- Provider retention and training treatment depend on the operator's current provider agreement.
  A deployment owner must verify and disclose those terms before enabling the feature.
- The endpoint constrains content but has no production authentication or rate limit. A public
  deployment needs abuse controls and provider spend limits before enabling a funded API key.

```mermaid
flowchart LR
    A["Learner's answers"] --> B["localStorage<br/>this browser only"]
    B --> C["Decision engine<br/>runs in the browser"]
    C --> D["Routes + plan<br/>rendered locally"]
    C -.->|"optional, off by default<br/>catalogue route + fixed reasons"| E["LLM provider"]

    style E stroke-dasharray: 5 5
```

---

## Safeguarding

A keyword rule (`lib/safety/`) scans free-text answers. If it matches, the app stops generating
career output from that answer and shows a support screen with the Thai Department of Mental Health
[hotline 1323](https://dmh.go.th/).

**Its limits, stated plainly:**

- It is a regular-expression list, not a risk assessment. It will miss real distress and will fire on harmless phrasing.
- Matching happens **in the browser**. Nothing is transmitted and **nobody is alerted** — there is no monitoring behind this.
- It records only which rule index fired, never the text that triggered it.
- This is a prototype-level mechanism. It must not be described as a validated safeguarding system.

---

## Not implemented

None of the following exists in the prototype, so no data flows through any of it:

| Feature | Status |
|---|---|
| Accounts, login, permanent saving | Planned |
| Parent view and counsellor view | Planned |
| Consent grant and revocation flow | Planned |
| Server-side storage (PostgreSQL) | Planned |
| Retention enforcement and audit logging | Planned |
| Field-level encryption of sensitive attributes | Planned |
| Data-subject request process | Planned |
| PDPA compliance review | Not started |

The production design for these is in [05 · System Architecture](05-system-architecture.md), clearly
marked as planned.

---

## PDPA position

The users are minors, so this matters more than usual. The honest position:

- The prototype minimises data by avoiding accounts and keeping learner answers in browser
  storage. That is useful privacy-by-design work, not a compliance conclusion.
- **No PDPA compliance review has been carried out.** A qualified review is required before a
  real-student pilot or public deployment that processes learner data.
- In-country data residency and ISO certification from a cloud provider would cover *where* data lives. Consent management, access control, minimisation, retention and processor governance are application-layer duties that remain with this project. Conflating the two is the most common way a project like this gets compliance wrong.

---

[← Roadmap](07-roadmap.md) · [Back to README](../READMEEN.md) · [Next: Source Review →](09-source-review.md)
