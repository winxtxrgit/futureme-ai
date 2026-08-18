"use client";

import { useId, useRef, useState } from "react";

/**
 * A tab strip that behaves like one.
 *
 * The landing page moved its explanation behind tabs so the page could lead
 * with the character and a single action instead of four paragraphs. That only
 * helps if the tabs are reachable — content moved behind a control a keyboard
 * cannot operate is content removed, so this implements the roles and the arrow
 * keys rather than styling buttons to look like tabs.
 *
 * Panels stay mounted and are hidden with `hidden`, so browser find-in-page and
 * the page's own anchor links still reach text that is not the open tab.
 */

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export function Tabs({ items, ariaLabel }: { items: TabItem[]; ariaLabel: string }) {
  const [active, setActive] = useState(0);
  const base = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const strip = useRef<HTMLDivElement>(null);

  const tabId = (index: number) => `${base}-tab-${items[index].id}`;
  const panelId = (index: number) => `${base}-panel-${items[index].id}`;

  /** Left/right wrap around; Home and End jump to the ends, as tabs should. */
  const onKeyDown = (event: React.KeyboardEvent) => {
    const last = items.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowRight") next = active === last ? 0 : active + 1;
    if (event.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    strip.current?.querySelectorAll<HTMLButtonElement>("[role='tab']")[next]?.focus();
  };

  return (
    <div>
      <div
        ref={strip}
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
        className="flex flex-wrap gap-2"
        data-testid="landing-tablist"
      >
        {items.map((item, index) => {
          const selected = index === active;
          return (
            <button
              key={item.id}
              id={tabId(index)}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={panelId(index)}
              /* Only the open tab is in the tab order; the arrow keys move
                 between them once inside, which is what a tab strip does. */
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(index)}
              data-testid={`landing-tab-${item.id}`}
              className={`rounded-full border px-4 py-1.5 text-sm font-bold transition-colors ${
                selected
                  ? "border-mint bg-mint/10 text-ink"
                  : "border-line bg-surface text-muted hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {items.map((item, index) => (
        <div
          key={item.id}
          id={panelId(index)}
          role="tabpanel"
          aria-labelledby={tabId(index)}
          hidden={index !== active}
          tabIndex={0}
          data-testid={`landing-panel-${item.id}`}
          className="mt-4 rounded-card border border-line bg-surface p-5"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
