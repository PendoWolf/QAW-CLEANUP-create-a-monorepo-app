import type { ReactNode } from "react";

/** A white panel with a border, and an optional heading. */
export function Card({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={["cd-card", className].filter(Boolean).join(" ")}>
      {title && <h2 className="cd-card-title">{title}</h2>}
      {children}
    </section>
  );
}
