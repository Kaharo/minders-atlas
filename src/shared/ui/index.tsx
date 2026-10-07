import type { ButtonHTMLAttributes, CSSProperties, InputHTMLAttributes, ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import s from './ui.module.css';

const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');

export const Card = ({ children, pad, className, style }: { children: ReactNode; pad?: boolean; className?: string; style?: CSSProperties }) =>
  <section className={cx(s.card, pad && s.cardPad, className)} style={style}>{children}</section>;

export const Kicker = ({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) =>
  <span className={cx(s.kicker, className)} style={style}>{children}</span>;

export const Mono = ({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) =>
  <span className={cx(s.mono, className)} style={style}>{children}</span>;

export const PillGroup = ({ children, className }: { children: ReactNode; className?: string }) => <div className={cx(s.pillGroup, className)}>{children}</div>;
export const Pill = ({ on, children, ...rest }: { on?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) =>
  <button type="button" className={cx(s.pill, on && s.pillOn)} aria-pressed={on} {...rest}>{children}</button>;
export const PillLink = ({ to, children }: { to: string; children: ReactNode }) =>
  <NavLink to={to} className={({ isActive }) => cx(s.pill, isActive && s.pillOn)}>{children}</NavLink>;

export const Button = ({ variant = 'solid', className, ...rest }: { variant?: 'solid' | 'ghost' | 'link' } & ButtonHTMLAttributes<HTMLButtonElement>) =>
  <button type="button" className={cx(s.btn, variant === 'ghost' && s.btnGhost, variant === 'link' && s.btnLink, className)} {...rest} />;

export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => <input className={s.input} {...p} />;

export const Dot = ({ size = 8, color, style }: { size?: number; color: string; style?: CSSProperties }) =>
  <span className={s.dot} style={{ width: size, height: size, background: color, ...style }} />;

export const Empty = ({ children }: { children: ReactNode }) => <span className={s.empty}>{children}</span>;
export const ErrorNote = ({ children }: { children: ReactNode }) => <div className={s.err}>{children}</div>;

export function Modal({ open, onClose, kicker, title, width = 740, children }: { open: boolean; onClose: () => void; kicker?: ReactNode; title: ReactNode; width?: number; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.dialog} style={{ maxWidth: width }} role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <div className={s.dialogHead}>
          <div className={s.dialogTitle}>
            {kicker && <Kicker>{kicker}</Kicker>}
            <h2 className={s.h2}>{title}</h2>
          </div>
          <button type="button" className={s.close} aria-label="close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
