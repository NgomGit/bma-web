type P = { className?: string };
const base = "w-[1em] h-[1em]";

const S = ({ children, className = "", w = 1.7 }: P & { children: React.ReactNode; w?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round"
       strokeLinejoin="round" className={className || base} aria-hidden>{children}</svg>
);

export const Phone = (p: P) => (
  <S {...p} w={1.9}><path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 6 6L16.5 12l4 1.5v3a2.5 2.5 0 0 1-2.8 2.5C10.6 18.2 5.3 12.9 4 5.8A2.5 2.5 0 0 1 6.5 3Z" /></S>
);
export const WhatsApp = ({ className = "" }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className || base} aria-hidden>
    <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.2-.7.9-.8 1-.3.2-.6 0a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.3 0-.4.1-.6l.4-.5.3-.5v-.5l-.8-2c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5 5 0 0 0 1 2.7 11.5 11.5 0 0 0 4.5 4 9.2 9.2 0 0 0 1.5.5 3.6 3.6 0 0 0 1.7.1 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z" />
  </svg>
);
export const Arrow = (p: P) => <S {...p} w={2}><path d="M5 12h13M12.5 5.5 19 12l-6.5 6.5" /></S>;
export const ArrowLeft = (p: P) => <S {...p} w={2}><path d="M19 12H6M11.5 5.5 5 12l6.5 6.5" /></S>;
export const Plus = (p: P) => <S {...p} w={2}><path d="M12 5v14M5 12h14" /></S>;
export const Close = (p: P) => <S {...p} w={2}><path d="M6 6l12 12M18 6 6 18" /></S>;
export const Check = (p: P) => <S {...p} w={2.2}><path d="m4.5 12.5 5 5 10-11" /></S>;
export const Sun = (p: P) => (
  <S {...p}><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7" /></S>
);
export const Moon = (p: P) => <S {...p}><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" /></S>;
export const Shield = (p: P) => <S {...p}><path d="M12 3l7.5 3v6c0 4.4-3.1 7.9-7.5 9-4.4-1.1-7.5-4.6-7.5-9V6Z" /><path d="m9 12 2 2 4-4.5" /></S>;
export const Doc = (p: P) => <S {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></S>;
export const Key = (p: P) => <S {...p}><circle cx="8" cy="15" r="4" /><path d="m11 12 8-8 2 2-2 2 2 2-2 2-2-2-2 2" /></S>;
export const Ship = (p: P) => <S {...p}><path d="M3 17h18l-1.5-5H4.5L3 17Z" /><path d="M6 12V8a2 2 0 0 1 2-2h6l3 3v3M4 20h16" /></S>;
export const Search = (p: P) => <S {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></S>;
export const User = (p: P) => <S {...p}><circle cx="12" cy="8" r="4" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></S>;
export const Pin = (p: P) => <S {...p}><path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></S>;
export const Clock = (p: P) => <S {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5.5l3.5 2" /></S>;
export const Gauge = (p: P) => <S {...p}><path d="M4.2 17.5a9 9 0 1 1 15.6 0" /><path d="m12 13 4-3.5" /><circle cx="12" cy="13.6" r="1.3" fill="currentColor" stroke="none" /></S>;
export const Gearbox = (p: P) => <S {...p}><path d="M6 5v14M12 5v6M18 5v14M6 11h12" /><circle cx="6" cy="4" r="1.4" /><circle cx="12" cy="4" r="1.4" /><circle cx="18" cy="4" r="1.4" /><circle cx="6" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /></S>;
export const Fuel = (p: P) => <S {...p}><path d="M4 21V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16M3 21h11M6.5 8h4" /><path d="M13 10h3.5a1.5 1.5 0 0 1 1.5 1.5V17a1.5 1.5 0 0 0 3 0V9.5L19 7" /></S>;
export const Seat = (p: P) => <S {...p}><circle cx="9" cy="7" r="3.2" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16.5 11.2A3 3 0 0 0 17 5.3M18 20a5.6 5.6 0 0 0-2.4-4.6" /></S>;
export const Star = ({ className = "" }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className || base} aria-hidden>
    <path d="m12 2 2.9 6.2 6.6.9-4.8 4.6 1.2 6.6L12 17.2 6.1 20.3l1.2-6.6L2.5 9.1l6.6-.9Z" />
  </svg>
);
