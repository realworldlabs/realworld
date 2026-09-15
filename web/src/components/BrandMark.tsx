/** The RealWorld globe: a tilted sphere with one meridian, one equator and a notch cut from the top right. Fills with currentColor. */
export function BrandMark({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", flex: "none" }}
    >
      <defs>
        <mask id="rw-globe-cuts">
          <rect width="512" height="512" fill="white" />
          <g transform="rotate(-18 256 256)" fill="none" stroke="black" strokeWidth="35.328">
            <ellipse cx="256" cy="256" rx="98.9184" ry="240.2304" />
            <path d="M 15.7696 256 Q 256 336.0768 496.2304 256" />
          </g>
          <g transform="rotate(-18 256 256)">
            <path d="M 385.536 8.704 L 503.296 126.464 L 503.296 8.704 Z" fill="black" />
          </g>
        </mask>
      </defs>
      <circle cx="256" cy="256" r="235.52" fill="currentColor" mask="url(#rw-globe-cuts)" />
    </svg>
  );
}
