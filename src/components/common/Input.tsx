import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

const FIELD_BASE =
  "w-full rounded-xl border bg-white px-3.5 text-sm text-slate-800 shadow-sm transition " +
  "placeholder:text-slate-400 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50";

function fieldClasses(hasError: boolean): string {
  return [
    FIELD_BASE,
    hasError
      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
      : "border-slate-200 hover:border-slate-300 focus:border-indigo-400 focus:ring-indigo-100",
  ].join(" ");
}

interface FieldShellProps {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

function FieldShell({ id, label, hint, error, required, children, className = "" }: FieldShellProps) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 flex items-center gap-1 text-[13px] font-semibold text-slate-700">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-[12px] font-medium text-rose-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[12px] text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  wrapperClassName?: string;
  ref?: Ref<HTMLInputElement>;
}

export function Input({
  label,
  hint,
  error,
  leftIcon,
  rightSlot,
  wrapperClassName,
  className = "",
  id,
  required,
  ref,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </span>
        )}
        <input
          id={fieldId}
          ref={ref}
          required={required}
          aria-invalid={Boolean(error)}
          className={[
            fieldClasses(Boolean(error)),
            "h-11",
            leftIcon ? "pl-10" : "",
            rightSlot ? "pr-11" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...rest}
        />
        {rightSlot && (
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2">{rightSlot}</span>
        )}
      </div>
    </FieldShell>
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

export function Textarea({ label, hint, error, wrapperClassName, className = "", id, required, ...rest }: TextareaProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      <textarea
        id={fieldId}
        required={required}
        aria-invalid={Boolean(error)}
        className={[fieldClasses(Boolean(error)), "min-h-[84px] resize-y py-2.5 leading-relaxed", className]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      />
    </FieldShell>
  );
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
  wrapperClassName?: string;
}

export function Select({ label, hint, error, options, wrapperClassName, className = "", id, required, ...rest }: SelectProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      <select
        id={fieldId}
        required={required}
        aria-invalid={Boolean(error)}
        className={[fieldClasses(Boolean(error)), "h-11 cursor-pointer appearance-none bg-[length:16px] pr-9", className]
          .filter(Boolean)
          .join(" ")}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
        }}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
