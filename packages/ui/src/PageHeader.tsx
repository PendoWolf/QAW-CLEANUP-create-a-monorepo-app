import type { ReactNode } from "react";

/** A page's heading, with a line under it and room for actions on the right. */
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <header className="cd-page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="cd-page-header-actions">{actions}</div>}
    </header>
  );
}
