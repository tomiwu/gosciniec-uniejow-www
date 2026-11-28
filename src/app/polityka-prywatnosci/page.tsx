import { LegalPlaceholder } from '@/components/LegalPlaceholder';
import { routeMetadata } from '@/lib/metadata';

const path = '/polityka-prywatnosci/';

// A lawyer has not written the text yet. Remove `noindex` from routes.ts when the text exists.
export const metadata = routeMetadata(path);

export default function Page() {
  return (
    <LegalPlaceholder path={path}>
      <section className="prose-lite" aria-labelledby="cookies-heading">
        <h2 id="cookies-heading">Krótka lista plików cookie</h2>
        <p>
          Poniższa lista opisuje pliki cookie używane na tej stronie w fazie 1. Pełny opis będzie w
          finalnym dokumencie polityki prywatności.
        </p>
        <table className="cookie-table">
          <caption className="visually-hidden">Pliki cookie na stronie Gościniec Uniejów</caption>
          <thead>
            <tr>
              <th scope="col">Nazwa</th>
              <th scope="col">Cel</th>
              <th scope="col">Czas</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>cc_cookie</code>
              </td>
              <td>Zapis wyboru baneru cookies (niezbędne).</td>
              <td>do ok. 6 miesięcy</td>
            </tr>
            <tr>
              <td>
                <code>gu-theme</code>
              </td>
              <td>Zapis jasnego lub ciemnego motywu strony (niezbędne, localStorage).</td>
              <td>do czasu wyczyszczenia przeglądarki</td>
            </tr>
            <tr>
              <td>
                <code>_ga</code>, <code>_ga_*</code>
              </td>
              <td>
                Google Analytics 4 — tylko po wyrażeniu zgody na analitykę w banerze (Consent Mode).
              </td>
              <td>zgodnie z dokumentacją Google</td>
            </tr>
          </tbody>
        </table>
      </section>
    </LegalPlaceholder>
  );
}
