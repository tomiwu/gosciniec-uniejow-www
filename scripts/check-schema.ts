import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PLACEHOLDER_BADGE_TEXT } from '../src/content/placeholders';
import { nap } from '../src/lib/nap';
import { offers } from '../src/lib/offers';

type Json = unknown;
type Node = Record<string, Json>;

const LD_JSON = /<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

export function extractJsonLd(html: string): string[] {
  return [...html.matchAll(LD_JSON)].map((match) => match[1] ?? '');
}

const isNode = (value: Json): value is Node =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function typesOf(node: Node): string[] {
  const type = node['@type'];
  if (typeof type === 'string') return [type];
  if (Array.isArray(type)) return type.filter((t): t is string => typeof t === 'string');
  return [];
}

/** Visit a node and every nested object. */
function walk(value: Json, visit: (node: Node) => void): void {
  if (Array.isArray(value)) {
    for (const item of value) walk(item, visit);
  } else if (isNode(value)) {
    visit(value);
    for (const child of Object.values(value)) walk(child, visit);
  }
}

const nonEmptyString = (value: Json): value is string =>
  typeof value === 'string' && value.trim().length > 0;

function checkHotel(node: Node, where: string): string[] {
  const errors: string[] = [];
  if (node['name'] !== nap.name) errors.push(`${where}: Hotel name differs from nap.ts`);
  if (node['telephone'] !== nap.phoneE164) {
    errors.push(`${where}: Hotel telephone differs from nap.ts`);
  }
  const address = node['address'];
  if (!isNode(address)) {
    errors.push(`${where}: Hotel address is missing`);
  } else {
    const expected: Record<string, string> = {
      streetAddress: nap.street,
      postalCode: nap.postalCode,
      addressLocality: nap.city,
      addressCountry: nap.country,
    };
    for (const [key, value] of Object.entries(expected)) {
      if (address[key] !== value) errors.push(`${where}: Hotel address.${key} differs from nap.ts`);
    }
  }
  return errors;
}

function checkHotelRoom(node: Node, where: string): string[] {
  const errors: string[] = [];
  if (!nonEmptyString(node['name'])) errors.push(`${where}: HotelRoom needs a name`);
  if (!nonEmptyString(node['description'])) {
    errors.push(`${where}: HotelRoom needs a description`);
  }
  return errors;
}

function checkFaqPage(node: Node, where: string): string[] {
  const entities = node['mainEntity'];
  const list = Array.isArray(entities) ? entities : entities === undefined ? [] : [entities];
  const valid = list.filter((q) => {
    if (!isNode(q) || !typesOf(q).includes('Question')) return false;
    const answer = q['acceptedAnswer'];
    return isNode(answer) && nonEmptyString(answer['text']);
  });
  if (valid.length === 0) {
    return [`${where}: FAQPage needs at least 1 Question with acceptedAnswer.text`];
  }
  return [];
}

function checkOffer(node: Node, where: string): string[] {
  const errors: string[] = [];
  const price = node['price'];
  if (typeof price === 'number' || (typeof price === 'string' && price.trim() !== '')) {
    const numeric = Number(price);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      errors.push(`${where}: Offer price must be a number greater than 0`);
    } else if (!offers.some((offer) => offer.price === numeric)) {
      // An Offer may only carry a real price: one that is in offers.ts (PRD D3).
      errors.push(`${where}: Offer price ${String(price)} is not in offers.ts`);
    }
  } else {
    errors.push(`${where}: Offer needs a price`);
  }
  if (node['priceCurrency'] !== 'PLN') errors.push(`${where}: Offer priceCurrency must be PLN`);
  return errors;
}

/** Facts of a venue that the owner has not confirmed. Sample figures must not reach the schema. */
const UNCONFIRMED_VENUE_KEYS = [
  'maximumAttendeeCapacity',
  'numberOfRooms',
  'floorSize',
  'offers',
  'event',
];

function checkVenue(node: Node, where: string, type: string): string[] {
  const errors: string[] = [];
  if (!nonEmptyString(node['name'])) errors.push(`${where}: ${type} needs a name`);
  for (const key of UNCONFIRMED_VENUE_KEYS) {
    if (node[key] !== undefined) {
      errors.push(`${where}: ${type} must not have ${key} (the figure is not confirmed)`);
    }
  }
  return errors;
}

/** Pages that must carry a given JSON-LD type. Key: HTML path in the export folder. */
const REQUIRED_TYPES: Record<string, string[]> = {
  'faq/index.html': ['FAQPage'],
  'pakiety/index.html': ['Offer'],
  'konferencje/index.html': ['FAQPage', 'MeetingRoom'],
  'przyjecia/index.html': ['FAQPage', 'EventVenue'],
};

export function requiredTypesFor(file: string): string[] {
  return REQUIRED_TYPES[file.replaceAll('\\', '/')] ?? [];
}

/** Check one HTML document. Returns error messages. */
export function checkHtml(html: string, file: string): string[] {
  const errors: string[] = [];
  const blocks = extractJsonLd(html);
  const seen = new Set<string>();
  let hotelCount = 0;

  blocks.forEach((raw, index) => {
    const where = `${file} [block ${index + 1}]`;
    if (raw.includes(PLACEHOLDER_BADGE_TEXT)) {
      errors.push(`${where}: JSON-LD contains placeholder text "${PLACEHOLDER_BADGE_TEXT}"`);
    }
    let data: Json;
    try {
      data = JSON.parse(raw);
    } catch {
      errors.push(`${where}: invalid JSON`);
      return;
    }
    const roots = Array.isArray(data) ? data : [data];
    for (const root of roots) {
      if (!isNode(root)) {
        errors.push(`${where}: JSON-LD root is not an object`);
        continue;
      }
      if (root['@context'] === undefined) errors.push(`${where}: missing @context`);
      walk(root, (node) => {
        const types = typesOf(node);
        for (const type of types) seen.add(type);
        if (node === root && types.length === 0 && !Array.isArray(root['@graph'])) {
          errors.push(`${where}: missing @type`);
        }
        if (types.includes('Hotel')) {
          hotelCount += 1;
          errors.push(...checkHotel(node, where));
        }
        if (types.includes('HotelRoom')) errors.push(...checkHotelRoom(node, where));
        if (types.includes('FAQPage')) errors.push(...checkFaqPage(node, where));
        if (types.includes('Offer')) errors.push(...checkOffer(node, where));
        for (const type of ['MeetingRoom', 'EventVenue']) {
          if (types.includes(type)) errors.push(...checkVenue(node, where, type));
        }
      });
    }
  });

  if (hotelCount === 0) errors.push(`${file}: no Hotel JSON-LD found`);
  for (const type of requiredTypesFor(file)) {
    if (!seen.has(type)) errors.push(`${file}: no ${type} JSON-LD found`);
  }
  return errors;
}

export function listHtmlFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((name) => name.endsWith('.html'))
    .map((name) => join(dir, name))
    .sort();
}

function main(): number {
  const dir = resolve(process.argv[2] ?? 'out');
  if (!existsSync(dir)) {
    console.error(`FAIL Missing directory: ${dir}. Run npm run build.`);
    return 1;
  }
  const files = listHtmlFiles(dir);
  if (files.length === 0) {
    console.error(`FAIL No HTML files in ${dir}`);
    return 1;
  }
  const errors: string[] = [];
  for (const file of files) {
    const label = relative(dir, file);
    // 404.html is an error page. It still carries the Hotel block from the root layout.
    errors.push(...checkHtml(readFileSync(file, 'utf8'), label));
  }
  for (const error of errors) console.error(`FAIL ${error}`);
  if (errors.length === 0) console.log(`schema OK: ${files.length} HTML files checked`);
  return errors.length === 0 ? 0 : 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main());
}
