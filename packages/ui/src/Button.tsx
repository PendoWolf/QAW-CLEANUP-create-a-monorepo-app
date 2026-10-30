import type { ButtonHTMLAttributes } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

/** Crewdesk's button. Defaults to type="button", so it never submits a form by accident. */
export function Button({ variant = "primary", type = "button", className, ...props }: ButtonProps) {
  return <button type={type} className={["cd-button", `cd-button-${variant}`, className].filter(Boolean).join(" ")} {...props} />;
}
