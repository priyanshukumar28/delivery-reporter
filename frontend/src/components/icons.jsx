function Svg({ children, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {children}
    </svg>
  );
}

export function PulseIcon({ size = 18, color = "#fff" }) {
  return (
    <Svg size={size}>
      <path d="M3 12h4l2-7 4 14 2-7h6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function CalendarIcon() {
  return (
    <Svg>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 9.5h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </Svg>
  );
}

export function SearchIcon() {
  return (
    <Svg size={15}>
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20 20l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export function SortIcon() {
  return (
    <Svg size={14}>
      <path d="M7 4v16M7 4l-3 3M7 4l3 3M17 20V4M17 20l-3-3M17 20l3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function DocIcon({ color = "currentColor" }) {
  return (
    <Svg size={18}>
      <path d="M6 3h9l3 3v15H6z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9 12h6M9 16h6" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </Svg>
  );
}

export function BoltIcon({ color = "currentColor" }) {
  return (
    <Svg size={18}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    </Svg>
  );
}

export function LayersIcon({ color = "currentColor" }) {
  return (
    <Svg size={18}>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M3 13l9 5 9-5M3 8v5M21 8v5" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
}

export function BugIcon({ color = "currentColor" }) {
  return (
    <Svg size={18}>
      <rect x="8" y="8" width="8" height="10" rx="4" stroke={color} strokeWidth="1.6" />
      <path d="M12 8V5M9 5 7 3M15 5l2-2M4 11h4M16 11h4M4 16h4M16 16h4M9 20l-2 2M15 20l2 2" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

export function SparkIcon({ color = "currentColor" }) {
  return (
    <Svg size={18}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

export function CopyIcon() {
  return (
    <Svg size={15}>
      <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.6" />
    </Svg>
  );
}

export function DownloadIcon() {
  return (
    <Svg size={15}>
      <path d="M12 3v12m0 0-4-4m4 4 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </Svg>
  );
}

export function PrintIcon() {
  return (
    <Svg size={15}>
      <path d="M6 9V3h12v6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <rect x="4" y="9" width="16" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M6 14h12v7H6z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </Svg>
  );
}

export function TrashIcon() {
  return (
    <Svg size={13}>
      <path d="M4 6h16M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function HistoryIcon() {
  return (
    <Svg size={15}>
      <path d="M3 3v5h5M3.5 13a9 9 0 1 0 2-6.5L3 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function CloseIcon() {
  return (
    <Svg size={12}>
      <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export function LogoutIcon() {
  return (
    <Svg size={17}>
      <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M15 16l4-4-4-4M19 12H9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function CheckIcon() {
  return (
    <Svg size={14}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
