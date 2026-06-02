import Image from "next/image";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export function GospelLensLogo({ size = 36, showText = true, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Image
        src="/logo.png"
        alt="Gospel Lens"
        width={size}
        height={size}
        className="rounded-sm object-contain"
      />
      {showText && (
        <span
          className="font-poppins font-bold tracking-tight text-text-primary hidden sm:inline"
          style={{ fontSize: size * 0.5 }}
        >
          Gospel<span className="text-primary">Lens</span>
        </span>
      )}
    </div>
  );
}
