import { ThankYou } from '@/components/ThankYou';
import { noindexMetadata } from '@/lib/metadata';

export const metadata = noindexMetadata(
  'Dziękujemy za wiadomość',
  'Wiadomość do hotelu Gościniec Uniejów została wysłana.',
);

export default function Page() {
  return (
    <ThankYou
      title="Dziękujemy za wiadomość"
      lead="Twoja wiadomość trafiła do recepcji. Odpowiemy na podany adres e-mail."
    />
  );
}
