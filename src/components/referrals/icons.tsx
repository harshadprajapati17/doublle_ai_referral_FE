import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function ClipboardIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden {...props}>
      <path d="M9 5.75h6" />
      <path d="M9.75 3.75h4.5A1.75 1.75 0 0 1 16 5.5v.25h1.5A2.5 2.5 0 0 1 20 8.25v9A2.5 2.5 0 0 1 17.5 19.75h-11A2.5 2.5 0 0 1 4 17.25v-9a2.5 2.5 0 0 1 2.5-2.5H8V5.5a1.75 1.75 0 0 1 1.75-1.75Z" />
    </svg>
  );
}

export function EmailIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="m5 8 7 5 7-5" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden {...props}>
      <path d="M4.5 4.5 19.5 19.5" />
      <path d="M19.5 4.5 4.5 19.5" />
    </svg>
  );
}

export function LinkedInIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden {...props}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 10v6" />
      <path d="M8 8h.01" />
      <path d="M12 16v-3.25A1.75 1.75 0 0 1 13.75 11 1.75 1.75 0 0 1 15.5 12.75V16" />
      <path d="M12 10v6" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden {...props}>
      <path d="M12 20a7.5 7.5 0 1 0-4.31-1.36L4 20l1.43-3.43A7.47 7.47 0 0 0 12 20Z" />
      <path d="M9.5 9.75c.16-.39.31-.4.45-.4h.39c.12 0 .3.04.45.36.15.32.52 1.24.57 1.33.05.09.08.2.02.33-.06.13-.1.21-.21.32-.11.11-.23.24-.33.32-.11.08-.22.17-.09.34.12.17.55.9 1.18 1.46.81.71 1.49.93 1.7 1.03.21.09.33.08.45-.05.12-.13.5-.57.63-.76.13-.19.26-.16.44-.09.18.07 1.15.54 1.34.64.19.09.31.14.36.22.04.08.04.47-.11.92-.15.45-.88.87-1.23.91-.35.04-.79.16-2.65-.57-2.26-.88-3.71-3.04-3.82-3.19-.11-.15-.92-1.22-.92-2.32 0-1.1.57-1.64.78-1.87Z" />
    </svg>
  );
}
