import type { ReactNode } from "react";

/** A message line: an error in red, or a success in green. */
export function Notice({ kind, children }: { kind: "error" | "success"; children: ReactNode }) {
  return (
    <p className={`cd-notice cd-notice-${kind}`} role={kind === "error" ? "alert" : "status"}>
      {children}
    </p>
  );
}
