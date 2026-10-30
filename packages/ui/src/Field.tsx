import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
};

/** A labelled text input. */
export function TextField({ label, value, onChange, ...input }: TextFieldProps) {
  return (
    <label className="cd-field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} {...input} />
    </label>
  );
}

export type SelectOption = { value: string; label: string };

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> & {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
};

/** A labelled drop-down. */
export function SelectField({ label, value, options, onChange, ...select }: SelectFieldProps) {
  return (
    <label className="cd-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} {...select}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
