/** Roof mark of the logo. The gold roof follows the brand colour #C59615 / #D6A317. */
export function LogoMark() {
  return (
    <svg className="logo__mark" viewBox="0 0 40 30" aria-hidden="true">
      <path
        d="M2 17 20 3l18 14"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M8 15v12h24V15"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect x="17" y="18" width="6" height="9" rx="1" fill="currentColor" />
    </svg>
  );
}
