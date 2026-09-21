"use client";
import { useFormStatus } from "react-dom";

export function Submit({ children, className = "btn-primary" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button className={className} disabled={pending}>
      {pending ? "…" : children}
    </button>
  );
}

/** Knop die eerst om bevestiging vraagt (in de pagina zelf, zonder browser-dialoog). */
export function ConfirmSubmit({ children, confirm, className = "btn-danger btn-sm" }: { children: React.ReactNode; confirm: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      className={className}
      disabled={pending}
      onClick={(e) => {
        const b = e.currentTarget;
        if (b.dataset.armed !== "1") {
          e.preventDefault();
          b.dataset.armed = "1";
          b.dataset.label = b.textContent || "";
          b.textContent = confirm;
          setTimeout(() => { b.dataset.armed = "0"; b.textContent = b.dataset.label || ""; }, 3500);
        }
      }}
    >
      {children}
    </button>
  );
}

/** Checkbox/knop die het formulier direct verstuurt. */
export function AutoSubmitSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} onChange={(e) => e.currentTarget.form?.requestSubmit()} />;
}
