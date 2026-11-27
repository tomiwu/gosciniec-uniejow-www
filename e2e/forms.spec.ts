import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const ENDPOINT = '**/api/contact.php';

/** Replace the PHP endpoint with a fake. No mail, no network. Returns the posted bodies. */
async function fakeEndpoint(page: Page, status: number, json: unknown) {
  const bodies: URLSearchParams[] = [];
  await page.route(ENDPOINT, async (route) => {
    bodies.push(new URLSearchParams(route.request().postData() ?? ''));
    await route.fulfill({ status, contentType: 'application/json', json });
  });
  return bodies;
}

async function fillGuest(page: Page) {
  await page.getByLabel('Imię i nazwisko').fill('Jan Testowy');
  await page.getByLabel('Adres e-mail').fill('jan.testowy@example.com');
  await page.getByRole('checkbox', { name: /Wyrażam zgodę/ }).check();
}

test.describe('/rezerwacja/', () => {
  test('has the heading, a phone link and the form', async ({ page }) => {
    await page.goto('/rezerwacja/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Rezerwacja – zapytanie o pobyt',
    );
    // The mobile action bar in the header has its own "Zadzwoń" link. Check the page link.
    await expect(page.locator('main').getByRole('link', { name: /Zadzwoń/ })).toHaveAttribute(
      'href',
      'tel:+48632888628',
    );
    for (const label of [
      'Data przyjazdu',
      'Data wyjazdu',
      'Liczba dorosłych',
      'Liczba dzieci',
      'Typ pokoju',
      'Imię i nazwisko',
      'Adres e-mail',
      'Telefon',
      'Wiadomość',
    ]) {
      await expect(page.getByLabel(label)).toBeVisible();
    }
    const consent = page.getByRole('checkbox', { name: /Wyrażam zgodę/ });
    await expect(consent).toBeVisible();
    await expect(page.getByRole('link', { name: 'polityce prywatności' })).toHaveAttribute(
      'href',
      '/polityka-prywatnosci/',
    );
  });

  test('works as a normal POST without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    let posted: URLSearchParams | undefined;
    await page.route(ENDPOINT, async (route) => {
      posted = new URLSearchParams(route.request().postData() ?? '');
      await route.fulfill({ status: 303, headers: { Location: '/rezerwacja/dziekujemy/' } });
    });
    await page.goto('/rezerwacja/');
    await page.getByLabel('Data przyjazdu').fill('2027-03-10');
    await page.getByLabel('Data wyjazdu').fill('2027-03-12');
    await fillGuest(page);
    await page.getByRole('button', { name: 'Wyślij zapytanie' }).click();
    await expect(page).toHaveURL(/\/rezerwacja\/dziekujemy\/$/);
    expect(posted?.get('form')).toBe('rezerwacja');
    expect(posted?.get('email')).toBe('jan.testowy@example.com');
    await context.close();
  });

  test('shows errors next to the fields and moves focus to the first error', async ({ page }) => {
    const bodies = await fakeEndpoint(page, 200, { ok: true });
    await page.goto('/rezerwacja/');
    await page.getByRole('button', { name: 'Wyślij zapytanie' }).click();

    const arrival = page.getByLabel('Data przyjazdu');
    await expect(arrival).toBeFocused();
    await expect(arrival).toHaveAttribute('aria-invalid', 'true');
    const describedBy = await arrival.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    await expect(page.locator(`#${describedBy}`)).toContainText('Wybierz datę przyjazdu.');
    await expect(page.locator('#field-name-error')).toContainText('Wpisz imię i nazwisko.');
    await expect(page.locator('#field-email-error')).toContainText('Wpisz adres e-mail.');
    await expect(page.locator('#field-consent-error')).toContainText('Zaznacz zgodę');
    expect(bodies).toHaveLength(0);

    const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });

  test('rejects a departure date that is not after arrival', async ({ page }) => {
    const bodies = await fakeEndpoint(page, 200, { ok: true });
    await page.goto('/rezerwacja/');
    await page.getByLabel('Data przyjazdu').fill('2027-03-10');
    await page.getByLabel('Data wyjazdu').fill('2027-03-10');
    await fillGuest(page);
    await page.getByRole('button', { name: 'Wyślij zapytanie' }).click();
    await expect(page.getByLabel('Data wyjazdu')).toBeFocused();
    await expect(page.locator('#field-departure-error')).toContainText('później');
    expect(bodies).toHaveLength(0);
  });

  test('posts to the endpoint and shows the thank-you page', async ({ page }) => {
    const bodies = await fakeEndpoint(page, 200, { ok: true });
    await page.goto('/rezerwacja/');
    await page.getByLabel('Data przyjazdu').fill('2027-03-10');
    await page.getByLabel('Data wyjazdu').fill('2027-03-12');
    await fillGuest(page);
    await page.getByRole('button', { name: 'Wyślij zapytanie' }).click();
    await expect(page).toHaveURL(/\/rezerwacja\/dziekujemy\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dziękujemy za zapytanie');
    expect(bodies).toHaveLength(1);
    expect(bodies[0]?.get('form')).toBe('rezerwacja');
    expect(bodies[0]?.get('arrival')).toBe('2027-03-10');
    expect(bodies[0]?.get('email')).toBe('jan.testowy@example.com');
    expect(bodies[0]?.get('website')).toBe('');
  });

  test('shows the errors that the server returns', async ({ page }) => {
    await fakeEndpoint(page, 422, { ok: false, errors: { email: 'Podaj poprawny adres e-mail.' } });
    await page.goto('/rezerwacja/');
    await page.getByLabel('Data przyjazdu').fill('2027-03-10');
    await page.getByLabel('Data wyjazdu').fill('2027-03-12');
    await fillGuest(page);
    await page.getByRole('button', { name: 'Wyślij zapytanie' }).click();
    await expect(page.getByLabel('Adres e-mail')).toBeFocused();
    await expect(page.locator('#field-email-error')).toContainText('Podaj poprawny adres e-mail.');
    await expect(page).toHaveURL(/\/rezerwacja\/$/);
  });

  test('shows a general error when the endpoint is not available', async ({ page }) => {
    await page.route(ENDPOINT, (route) => route.abort());
    await page.goto('/rezerwacja/');
    await page.getByLabel('Data przyjazdu').fill('2027-03-10');
    await page.getByLabel('Data wyjazdu').fill('2027-03-12');
    await fillGuest(page);
    await page.getByRole('button', { name: 'Wyślij zapytanie' }).click();
    const alert = page.locator('form').getByRole('alert');
    await expect(alert).toContainText('Nie udało się wysłać formularza');
    await expect(alert).toBeFocused();
  });

  test('preselects the room from ?pokoj=', async ({ page }) => {
    await page.goto('/rezerwacja/?pokoj=apartament-rodzinny');
    await expect(page.getByLabel('Typ pokoju')).toHaveValue('Apartament rodzinny');
  });

  test('keeps the honeypot out of sight and out of the tab order', async ({ page }) => {
    await page.goto('/rezerwacja/');
    const trap = page.locator('input[name="website"]');
    await expect(trap).toHaveAttribute('tabindex', '-1');
    await expect(trap).toHaveAttribute('autocomplete', 'off');
    await expect(trap.locator('xpath=ancestor::div[@aria-hidden="true"]')).toHaveCount(1);
    const box = await trap.boundingBox();
    expect(box).not.toBeNull();
    // Outside the screen: left of the viewport and not scrollable into view.
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(0);
    // Tab through the whole form: the honeypot never gets focus.
    await page.getByLabel('Data przyjazdu').focus();
    for (let i = 0; i < 20; i += 1) {
      await page.keyboard.press('Tab');
      await expect(trap).not.toBeFocused();
    }
  });
});

test.describe('/kontakt/', () => {
  test('shows the address, links and directions without a map iframe', async ({ page }) => {
    await page.goto('/kontakt/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kontakt');
    const address = page.locator('main address');
    await expect(address).toContainText('ul. Sienkiewicza 137');
    await expect(address).toContainText('99-210 Uniejów');
    await expect(address.getByRole('link', { name: '+48 63 28 88 628' })).toHaveAttribute(
      'href',
      'tel:+48632888628',
    );
    await expect(
      address.getByRole('link', { name: 'kontakt@gosciniecuniejow.pl' }),
    ).toHaveAttribute('href', 'mailto:kontakt@gosciniecuniejow.pl');
    await expect(page.getByRole('link', { name: 'Otwórz w Mapach Google' })).toHaveAttribute(
      'href',
      'https://www.google.com/maps/search/?api=1&query=Go%C5%9Bciniec+Uniej%C3%B3w+Sienkiewicza+137',
    );
    await expect(page.getByText('autostrady A2')).toBeVisible();
    await expect(page.locator('iframe')).toHaveCount(0);
  });

  test('has the form with a subject and without dates and room', async ({ page }) => {
    await page.goto('/kontakt/');
    await expect(page.getByLabel('Temat')).toBeVisible();
    await expect(page.getByLabel('Data przyjazdu')).toHaveCount(0);
    await expect(page.getByLabel('Typ pokoju')).toHaveCount(0);
    await expect(page.locator('input[name="form"]')).toHaveValue('kontakt');
  });

  test('preselects the subject from ?temat=', async ({ page }) => {
    await page.goto('/kontakt/?temat=konferencje');
    await expect(page.getByLabel('Temat')).toHaveValue('Konferencje i szkolenia');
  });

  test('ignores an unknown ?temat=', async ({ page }) => {
    await page.goto('/kontakt/?temat=nie-ma');
    await expect(page.getByLabel('Temat')).toHaveValue('');
  });

  test('shows errors and moves focus to the first one', async ({ page }) => {
    const bodies = await fakeEndpoint(page, 200, { ok: true });
    await page.goto('/kontakt/');
    await page.getByRole('button', { name: 'Wyślij wiadomość' }).click();
    await expect(page.getByLabel('Temat')).toBeFocused();
    await expect(page.locator('#field-subject-error')).toContainText('Wybierz temat');
    await expect(page.locator('#field-message-error')).toContainText('Napisz wiadomość.');
    expect(bodies).toHaveLength(0);
  });

  test('posts to the endpoint and shows the thank-you page', async ({ page }) => {
    const bodies = await fakeEndpoint(page, 200, { ok: true });
    await page.goto('/kontakt/?temat=przyjecia');
    await fillGuest(page);
    await page.getByLabel('Wiadomość').fill('Pytam o termin.');
    await page.getByRole('button', { name: 'Wyślij wiadomość' }).click();
    await expect(page).toHaveURL(/\/kontakt\/dziekujemy\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dziękujemy za wiadomość');
    expect(bodies[0]?.get('form')).toBe('kontakt');
    expect(bodies[0]?.get('subject')).toBe('Przyjęcia okolicznościowe');
  });
});

for (const path of ['/kontakt/dziekujemy/', '/rezerwacja/dziekujemy/']) {
  test.describe(path, () => {
    test('loads, has noindex and has no axe violations', async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
      const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
      expect(results.violations).toEqual([]);
    });
  });
}
