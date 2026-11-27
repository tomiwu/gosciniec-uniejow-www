import { ThankYou } from '@/components/ThankYou';
import { noindexMetadata } from '@/lib/metadata';

export const metadata = noindexMetadata(
  'Dziękujemy za zapytanie',
  'Zapytanie o pobyt w hotelu Gościniec Uniejów zostało wysłane.',
);

export default function Page() {
  return (
    <ThankYou
      title="Dziękujemy za zapytanie"
      lead="Twoje zapytanie o pobyt trafiło do recepcji. To nie jest rezerwacja. Odpowiemy na podany adres e-mail i ustalimy szczegóły."
    />
  );
}
