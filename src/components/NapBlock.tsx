import { nap } from '@/lib/nap';

export function NapBlock() {
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
