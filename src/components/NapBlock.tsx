import { nap } from '@/lib/nap';

interface NapBlockProps {
  /**
   * Show the address, the phone and the e-mail as separate items with one equal gap
   * (`--space-4`). Each item has `data-contact-item`. The footer uses the default text block.
   */
  stacked?: boolean;
}

export function NapBlock({ stacked = false }: NapBlockProps) {
  if (stacked) {
    return (
      <address className="nap nap--stacked">
        <div data-contact-item>
          <strong>{nap.name}</strong>
          <br />
          {nap.street}
          <br />
          {nap.postalCode} {nap.city}
        </div>
        <div data-contact-item>
          tel. <a href={`tel:${nap.phoneE164}`}>{nap.phoneDisplay}</a>
        </div>
        <div data-contact-item>
          <a href={`mailto:${nap.email}`}>{nap.email}</a>
        </div>
      </address>
    );
  }
  return (
    <address className="nap">
      <strong>{nap.name}</strong>
      <br />
      {nap.street}
      <br />
      {nap.postalCode} {nap.city}
      <br />
      tel. <a href={`tel:${nap.phoneE164}`}>{nap.phoneDisplay}</a>
      <br />
      <a href={`mailto:${nap.email}`}>{nap.email}</a>
    </address>
  );
}
