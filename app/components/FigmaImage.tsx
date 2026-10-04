import type { CSSProperties } from "react";

/** Original Figma fill, retaining the source image and its exported crop geometry. */
export function FigmaImage({ src, alt = "", className = "", crop, priority = false }: { src: string; alt?: string; className?: string; crop?: CSSProperties; priority?: boolean }) {
  return <div className={`${className.split(" ").includes("absolute") ? "" : "relative"} overflow-hidden ${className}`}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} className="absolute max-w-none" style={crop || { inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
  </div>;
}
