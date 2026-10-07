/** Isotipo de RefundyTax (el mismo del mockup). */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 3.5h6.2L18 7.3v9.2H8z" />
      <path d="M14.2 3.5V7.3H18" />
      <path d="M10.3 10h4M10.3 12.4h2.6" />
      <path d="M6.2 16.4a4.1 4.1 0 1 0 1.25-2.95" />
      <path d="M6.2 12.1v2.7h2.7" />
    </svg>
  );
}
