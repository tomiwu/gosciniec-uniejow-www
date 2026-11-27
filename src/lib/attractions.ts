import type { ImageSlug } from './images';

/**
 * One attraction on `/atrakcje/`.
 * Source: `docs/source/atrakcje-w-okolicy.md`, `docs/source/wokol-hotelu.md`.
 * Add no fact that the source lacks. The source has no URL of an official site, so there is no `url`.
 */
export interface Attraction {
  /** URL-safe id. Used for the heading id. */
  slug: string;
  /** Polish heading (h2). */
  name: string;
  /** Polish text. 2 to 4 sentences. */
  paragraphs: readonly string[];
  /** Distance from the hotel in Polish. Only when the source gives it. */
  distance?: string;
  /** Polish text of a visible TODO marker for a fact that is still missing. */
  todo?: string;
  /** Optional photo. Alt text is Polish and describes only what the photo shows. */
  image?: { slug: ImageSlug; alt: string };
}

export const attractions: readonly Attraction[] = [
  {
    slug: 'termy-uniejow',
    name: 'Termy Uniejów',
    paragraphs: [
      'Termy Uniejów to publiczny kompleks termalny i basenowy. Nie należy do hotelu.',
      'Uniejów jest pierwszym uzdrowiskiem termalnym w Polsce, a woda geotermalna ma niemal 70°C.',
      'Hotel ma własną strefę Wellness z jacuzzi, sauną fińską i siłownią.',
    ],
    distance: 'około 3 km od hotelu',
    image: {
      slug: 'termy',
      alt: 'Basen termalny z wodnym parasolem, w którym bawią się dzieci i dorośli',
    },
  },
  {
    slug: 'zamek',
    name: 'Zamek Arcybiskupów Gnieźnieńskich',
    paragraphs: [
      'Zamek w Uniejowie to główny punkt zwiedzania miasta. Jest to XIV-wieczna letnia posiadłość arcybiskupów gnieźnieńskich.',
      'Zamek stoi w sercu XIX-wiecznego parku w stylu brytyjskim. Zwiedzanie zamku może obejmować pokazy średniowieczne i degustację miodów pitnych.',
    ],
    todo: 'TODO: godziny zwiedzania i ceny biletów – sprawdź u organizatora',
  },
  {
    slug: 'park-zamkowy',
    name: 'Park Zamkowy',
    paragraphs: [
      'Park Zamkowy sąsiaduje z Termami i z zamkiem. Drzewostan parku jest bardzo różnorodny i należy do największych w Polsce.',
      'Na terenie parku jest 30 zbiorowisk roślin i 81 gatunków drzew i krzewów. Park należy do Uniejowskiego Obszaru Chronionego Krajobrazu i do sieci Natura 2000 Dolina Środkowej Warty.',
    ],
  },
  {
    slug: 'teznie',
    name: 'Tężnie solankowe',
    paragraphs: [
      'W Uniejowie działają tężnie solankowe. Dobrze łączą się ze spacerem po bulwarach i z wizytą w termach.',
    ],
    todo: 'TODO: lokalizacja tężni i godziny dostępu – stare strony hotelu ich nie podają',
  },
  {
    slug: 'bulwary',
    name: 'Bulwary nad Wartą',
    paragraphs: [
      'Nadwarciańskie bulwary zapraszają na spacer wzdłuż rzeki.',
      'Dolina Warty ma dużą wartość przyrodniczą. Bulwary dobrze łączą się ze zwiedzaniem parku i zamku.',
    ],
  },
  {
    slug: 'zagroda-mlynarska',
    name: 'Zagroda Młynarska',
    paragraphs: [
      'Chłopska Zagroda Młynarska to skansen dawnej architektury wiejskiej województwa łódzkiego. Stoją w niej dwór z Nagórek, dwa koźlaki, czyli tradycyjne wiatraki z Chorzepina i Zbylczyc, obiekt inwentarski z Uniejowa i chałupa ze Skotnik.',
      'Zbiór uzupełnia wierna replika stodoły z Besiekier. W zagrodzie możesz upiec chleb.',
    ],
    todo: 'TODO: terminy warsztatów chlebowych i ceny – sprawdź u organizatora',
  },
  {
    slug: 'splyw-kajakowy',
    name: 'Spływ kajakowy Wartą',
    paragraphs: [
      'Gościniec leży blisko Warty. Dlatego jest dobrym miejscem dla miłośników kajaków.',
      'Spływ Wartą to nie tylko sport. To wyprawa w świat natury, w którym każdy zakręt rzeki pokazuje nowy widok.',
    ],
    todo: 'TODO: organizator spływów, trasy i ceny – brak w źródle',
  },
  {
    slug: 'sciezka-zielen',
    name: 'Ścieżka rowerowa „Zieleń”',
    paragraphs: [
      'Edukacyjna ścieżka rowerowa „Zieleń” łączy jazdę na rowerze z poznawaniem przyrody. To propozycja dla gości, którzy lubią aktywny wypoczynek na świeżym powietrzu.',
    ],
    todo: 'TODO: przebieg i długość trasy – brak w źródle',
  },
  {
    slug: 'zielarka',
    name: 'Spacer z zielarką po Dolinie Warty',
    paragraphs: [
      'Dolina Warty zaprasza na spacer z zielarką. To spokojny sposób na poznawanie przyrody doliny.',
      'Dla miłośników sportu jest spływ kajakowy i ścieżka rowerowa.',
    ],
    todo: 'TODO: organizator i terminy spacerów – brak w źródle',
  },
  {
    slug: 'kolegiata',
    name: 'Kolegiata Wniebowzięcia NMP',
    paragraphs: [
      'Gotycka kolegiata z XIV wieku to architektoniczny klejnot Uniejowa. Prezbiterium pochodzi z 1349 roku i ma oryginalne sklepienie krzyżowo-żebrowe.',
      'We wnętrzu stoi sarkofag świętego Bogumiła z czarnego marmuru, ufundowany w 1666 roku przez abp. Wacława Leszczyńskiego. To drugi najstarszy taki zabytek w kraju, po konfesji św. Stanisława na Wawelu, a starszy od konfesji św. Wojciecha w Gnieźnie.',
    ],
  },
  {
    slug: 'rynek',
    name: 'Rynek i dzwonnica',
    paragraphs: [
      'Uniejów nie ma ratusza, ale zachował średniowieczny układ ulic. Centrum miasta to rynek.',
      'Pejzaż miasta wyznacza 25-metrowa neobarokowa dzwonnica. Pełni też funkcję zegara.',
    ],
  },
  {
    slug: 'dworek',
    name: 'Dworek z 1845 roku',
    paragraphs: [
      'Późnoklasycystyczny dworek z 1845 roku stoi w sercu Uniejowa, przy ulicy Targowej. Jego historia wiąże się z rodziną Hofmajstrów, krewnych Tollów, dawnych zarządców zamku.',
      'Dworek ma kształt prostokąta. Gzyms między drzwiami a oknami poddasza upamiętnia datę jego powstania.',
    ],
  },
  {
    slug: 'cerkiewka',
    name: 'Cerkiewka z 1885 roku',
    paragraphs: [
      'Cerkiewka stoi na północnym skraju miasta. To prawosławna kaplica grobowa, która upamiętnia gen. Aleksandra Tolla i jego rodzinę.',
      'Po wojnie obok kaplicy ponownie pochowano generała, jego żonę i syna Sergiusza. Kaplicę zniszczono, a w latach 1988–1990 starannie odrestaurowano.',
    ],
  },
  {
    slug: 'spycimierz',
    name: 'Spycimierz i kwiatowe dywany',
    paragraphs: [
      'Spycimierz to mała parafia w gminie Uniejów. W 2021 roku UNESCO uhonorowało ją za ponad dwustuletnią tradycję kwiatowych dywanów na procesję Bożego Ciała.',
      'Kwiatowy dywan ma prawie kilometr długości. Procesja odbywa się po nabożeństwie.',
    ],
    todo: 'TODO: odległość od hotelu – brak w źródle',
  },
  {
    slug: 'zoo-safari-borysew',
    name: 'Zoo Safari Borysew',
    paragraphs: [
      'Zoo Safari Borysew to jedna z atrakcji regionu, które można odwiedzić podczas pobytu w Uniejowie.',
      'Dojazd i warunki zwiedzania sprawdź u organizatora.',
    ],
    todo: 'TODO: odległość od hotelu i godziny – brak w źródle',
  },
];
