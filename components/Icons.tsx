import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

function baseSvgProps(size = 18, className = "w-5 h-5", style?: React.CSSProperties) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    style: {
      width: `${size}px`,
      height: `${size}px`,
      minWidth: `${size}px`,
      minHeight: `${size}px`,
      flexShrink: 0,
      display: "inline-block",
      ...style,
    },
  };
}

export function IconSun({ className = "w-5 h-5", size = 18, style, ...props }: IconProps) {
  return (
    <svg {...baseSvgProps(size, className, style)} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

export function IconCloudRain({ className = "w-5 h-5", size = 18, style, ...props }: IconProps) {
  return (
    <svg {...baseSvgProps(size, className, style)} {...props}>
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M16 14v6M8 14v6M12 16v6" />
    </svg>
  );
}

export function IconWind({ className = "w-5 h-5", size = 18, style, ...props }: IconProps) {
  return (
    <svg {...baseSvgProps(size, className, style)} {...props}>
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2M9.6 4.6A2 2 0 1 1 11 8H2M12.6 19.4A2 2 0 1 0 14 16H2" />
    </svg>
  );
}

export function IconCloud({ className = "w-5 h-5", size = 18, style, ...props }: IconProps) {
  return (
    <svg {...baseSvgProps(size, className, style)} {...props}>
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  );
}

export function IconThermometer({ className = "w-5 h-5", size = 18, style, ...props }: IconProps) {
  return (
    <svg {...baseSvgProps(size, className, style)} {...props}>
      <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
    </svg>
  );
}

export function IconDroplets({ className = "w-5 h-5", size = 18, style, ...props }: IconProps) {
  return (
    <svg {...baseSvgProps(size, className, style)} {...props}>
      <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05Z" />
      <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" />
    </svg>
  );
}

export function IconSparkles({ className = "w-5 h-5", size = 18, style, ...props }: IconProps) {
  return (
    <svg {...baseSvgProps(size, className, style)} {...props}>
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}

export function IconMessageCircle({ className = "w-5 h-5", size = 18, style, ...props }: IconProps) {
  return (
    <svg {...baseSvgProps(size, className, style)} {...props}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

export function IconX({ className = "w-5 h-5", size = 18, style, ...props }: IconProps) {
  return (
    <svg {...baseSvgProps(size, className, style)} {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function IconSend({ className = "w-5 h-5", size = 18, style, ...props }: IconProps) {
  return (
    <svg {...baseSvgProps(size, className, style)} {...props}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

export function IconMic({ className = "w-5 h-5", size = 18, style, ...props }: IconProps) {
  return (
    <svg {...baseSvgProps(size, className, style)} {...props}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" />
    </svg>
  );
}

export function IconMapPin({ className = "w-5 h-5", size = 18, style, ...props }: IconProps) {
  return (
    <svg {...baseSvgProps(size, className, style)} {...props}>
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function IconAlertTriangle({ className = "w-5 h-5", size = 18, style, ...props }: IconProps) {
  return (
    <svg {...baseSvgProps(size, className, style)} {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function IconCompass({ className = "w-5 h-5", size = 18, style, ...props }: IconProps) {
  return (
    <svg {...baseSvgProps(size, className, style)} {...props}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

export function IconCheck({ className = "w-5 h-5", size = 18, style, ...props }: IconProps) {
  return (
    <svg {...baseSvgProps(size, className, style)} {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function IconInfo({ className = "w-5 h-5", size = 18, style, ...props }: IconProps) {
  return (
    <svg {...baseSvgProps(size, className, style)} {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export function IconVolume2({ className = "w-5 h-5", size = 18, style, ...props }: IconProps) {
  return (
    <svg {...baseSvgProps(size, className, style)} {...props}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

export function IconVolumeX({ className = "w-5 h-5", size = 18, style, ...props }: IconProps) {
  return (
    <svg {...baseSvgProps(size, className, style)} {...props}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="22" y1="9" x2="16" y2="15" />
      <line x1="16" y1="9" x2="22" y2="15" />
    </svg>
  );
}
