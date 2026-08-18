# Aurora Prototype

This is a dependency-free responsive HTML/CSS/JavaScript prototype. It demonstrates:

- Landing page
- AI interview and editable evidence
- Three explainable career-route results
- Private student dashboard
- Editable future roadmap
- Dark-first and light themes
- Mobile bottom navigation
- Keyboard focus, live status, reduced-motion, and high-contrast accommodations
- Wireframe rendering mode

## Run

From the workspace root:

```bash
python3 -m http.server 8080 --directory FutureMe_Web_Design_Concepts
```

Open:

```text
http://localhost:8080/11_Concept_11/prototype/?page=landing
```

## Routes

```text
?page=landing
?page=interview
?page=results
?page=dashboard
?page=roadmap
```

Append `&mode=wireframe` to render a grayscale structural view, for example:

```text
?page=results&mode=wireframe
```

Append `&theme=light` to open a page directly in the light theme for review.

## Notes

- No package install, build tool, analytics, network request, account, microphone access, or AI API is required.
- Interactions are local demonstration states only; refresh resets page-level task data.
- The production system must implement authenticated consent records, server-side policy validation, source freshness, model evaluation, audit logs, and the documented human-support protocol.
