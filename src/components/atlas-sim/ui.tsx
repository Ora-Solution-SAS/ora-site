/**
 * Atlas simulation — shared UI primitives.
 *
 * Exact recipes from the production design system (see brief §1): pill
 * buttons, cards, inputs, radio option-cards, badges, modal/popover shells
 * and the signature keyframes. Everything is Inter/Poppins on #fcfbf7.
 */
import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { initialsOf } from "./data";

export const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/** Injected once by the sim root — signature keyframes from the brief. */
export const SIM_KEYFRAMES = `
@keyframes ora-modal-pop { from { opacity: 0; transform: scale(.96) translateY(4px); } to { opacity: 1; transform: none; } }
@keyframes ora-accordion-expand { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
@keyframes ora-step-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes ora-drawer-in { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: none; } }
@keyframes ora-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes ora-spin { to { transform: rotate(360deg); } }
`;

/* -------------------------------------------------------------- buttons */

export function BtnPrimary({
  children,
  onClick,
  disabled,
  className = "",
  small,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-[#3b82f6] ${
        small ? "px-3 py-1.5 text-[12px]" : "px-4 py-2 text-[13px]"
      } font-semibold font-inter text-white shadow-[0_2px_12px_rgba(59,130,246,0.30)] transition-all duration-150 hover:bg-[#2563eb] hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none ${className}`}
    >
      {children}
    </button>
  );
}

export function BtnSoft({
  children,
  onClick,
  className = "",
  small,
  danger,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  small?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full border border-[#e5e7eb] bg-white ${
        small ? "px-3 py-1.5 text-[12px]" : "px-3 py-2 text-[13px]"
      } font-medium font-inter transition-colors duration-150 ${
        danger ? "text-[#ef4444] hover:bg-[#fee2e2]" : "text-[#6b7280] hover:bg-[#f5f8ff]"
      } ${className}`}
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------- shells */

export function Card({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`rounded-2xl border border-[#e5e7eb] bg-white ${className}`}
      style={{ boxShadow: "0 1px 3px rgba(15,23,42,.04), 0 8px 24px -12px rgba(15,23,42,.10)", ...style }}
    >
      {children}
    </div>
  );
}

export function Input({
  value,
  onChange,
  placeholder,
  onEnter,
  autoFocus,
  mono,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onEnter?: () => void;
  autoFocus?: boolean;
  mono?: boolean;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      autoFocus={autoFocus}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onEnter) onEnter();
        e.stopPropagation();
      }}
      className={`h-11 w-full rounded-xl border border-[#e5e7eb] bg-white px-3.5 text-[13.5px] font-inter text-[#111827] placeholder:text-[#9ca3af] outline-none transition-shadow focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/15 ${
        mono ? "font-mono text-[12.5px]" : ""
      } ${className}`}
    />
  );
}

/** Label « eyebrow » 10.5–11px UPPERCASE tracking. */
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`text-[10.5px] font-semibold font-inter uppercase tracking-[0.14em] text-[#9ca3af] ${className}`}>
      {children}
    </div>
  );
}

/* --------------------------------------------------- radio option cards */

/** Card-option radio — pattern signature des dialogues (brief §1). */
export function OptionCard({
  icon,
  title,
  hint,
  selected,
  onClick,
  children,
  tintSolid,
}: {
  icon: ReactNode;
  title: string;
  hint: string;
  selected?: boolean;
  onClick?: () => void;
  children?: ReactNode;
  /** optional solid tint for the unselected icon (type cards du wizard) */
  tintSolid?: string;
}) {
  return (
    // Rendered as a div (not a <button>) so callers can nest interactive
    // controls (inputs, "Changer" links) in `children` without invalid
    // nested-button HTML. Keyboard activation is preserved via role/tabIndex.
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`w-full cursor-pointer rounded-2xl border p-3 text-left transition-all duration-150 ${
        selected
          ? "border-[#3b82f6] bg-[#eff6ff]"
          : "border-[#e5e7eb] bg-white hover:-translate-y-px hover:bg-[#f5f8ff]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
            selected ? "bg-gradient-to-br from-[#3b82f6] to-[#0d9488] text-white" : "bg-[#f5f8ff]"
          }`}
          style={!selected ? { color: tintSolid ?? "#6b7280" } : undefined}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold font-inter text-[#111827]">{title}</div>
          <div className="mt-0.5 text-[11.5px] font-inter leading-snug text-[#6b7280]">{hint}</div>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- badges */

export function Chip({
  children,
  className = "",
  dotColor,
  style,
  onClick,
  title,
}: {
  children: ReactNode;
  className?: string;
  dotColor?: string;
  style?: CSSProperties;
  onClick?: () => void;
  title?: string;
}) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      title={title}
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium font-inter whitespace-nowrap ${className}`}
      style={style}
    >
      {dotColor && <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: dotColor }} />}
      {children}
    </Tag>
  );
}

export function Avatar({
  name,
  color,
  size = 24,
  ring,
}: {
  name: string;
  color: string;
  size?: number;
  ring?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-semibold font-inter select-none ${
        ring ? "ring-2 ring-white" : ""
      }`}
      style={{ width: size, height: size, background: color, fontSize: Math.max(8.5, size * 0.38) }}
      title={name}
    >
      {initialsOf(name)}
    </div>
  );
}

export function Spinner({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`inline-block rounded-full border-2 border-[#3b82f6]/25 border-t-[#3b82f6] ${className}`}
      style={{ width: size, height: size, animation: "ora-spin .7s linear infinite" }}
    />
  );
}

/* ---------------------------------------------------------------- modal */

/**
 * Modal contained INSIDE the simulation window (absolute, not fixed): the
 * whole sim lives in a scaled 1020px frame on the landing page, so dialogs
 * must stay inside it to preserve the illusion.
 */
export function Modal({
  onClose,
  children,
  maxW = 448,
  align = "center",
}: {
  onClose?: () => void;
  children: ReactNode;
  maxW?: number;
  align?: "center" | "top";
}) {
  return (
    <div
      className={`absolute inset-0 z-40 flex justify-center bg-[#111827]/30 backdrop-blur-sm ${
        align === "center" ? "items-center" : "items-start pt-12"
      }`}
      style={{ animation: `ora-fade-in 160ms ${EASE}` }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className="relative w-full rounded-2xl border border-[#e5e7eb] bg-white p-5"
        style={{
          maxWidth: maxW,
          boxShadow: "0 24px 64px -16px rgba(15,23,42,.28), 0 4px 16px rgba(15,23,42,.10)",
          animation: `ora-modal-pop 160ms ${EASE}`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalClose({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-3.5 top-3.5 flex h-7 w-7 items-center justify-center rounded-full text-[#9ca3af] transition-colors hover:bg-[#f5f8ff] hover:text-[#6b7280]"
    >
      <X size={15} strokeWidth={2.4} />
    </button>
  );
}

/* --------------------------------------------------------------- popover */

/**
 * Lightweight popover: absolutely positioned panel + invisible backdrop that
 * closes on outside click. Position it via className (e.g. "top-full mt-2").
 */
export function Popover({
  onClose,
  children,
  className = "",
  width = 260,
}: {
  onClose: () => void;
  children: ReactNode;
  className?: string;
  width?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onClose]);
  return (
    <div
      ref={ref}
      className={`absolute z-30 rounded-2xl border border-[#e5e7eb] bg-white p-2 ${className}`}
      style={{
        width,
        boxShadow: "0 16px 40px -12px rgba(15,23,42,.22), 0 2px 8px rgba(15,23,42,.08)",
        animation: `ora-modal-pop 160ms ${EASE}`,
      }}
    >
      {children}
    </div>
  );
}

/** Menu row used inside popovers/dropdowns. */
export function MenuItem({
  children,
  onClick,
  danger,
  active,
}: {
  children: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-[12.5px] font-medium font-inter transition-colors ${
        danger
          ? "text-[#ef4444] hover:bg-[#fee2e2]"
          : active
            ? "bg-[#eff6ff] text-[#3b82f6]"
            : "text-[#374151] hover:bg-[#f5f8ff]"
      }`}
    >
      {children}
    </button>
  );
}

/* ----------------------------------------------------------------- toast */

export function Toast({ children }: { children: ReactNode }) {
  return (
    <div
      className="pointer-events-none absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-[12.5px] font-medium font-inter text-[#111827]"
      style={{
        boxShadow: "0 12px 32px -8px rgba(15,23,42,.25)",
        animation: `ora-modal-pop 180ms ${EASE}`,
      }}
    >
      {children}
    </div>
  );
}
