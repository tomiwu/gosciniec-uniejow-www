// Written by scripts/fetch-images.ts. Do not edit by hand.
export interface ImageEntry {
  slug: string;
  /** Widths (px) that exist on disk as AVIF, WebP and JPEG. The last one is the largest. */
  widths: readonly number[];
  /** Intrinsic width (px) of the largest file. */
  width: number;
  /** Intrinsic height (px) of the largest file. */
  height: number;
}

export const images = [
  { slug: 'biznes', widths: [268], width: 268, height: 299 },
  { slug: 'dsc03928', widths: [480, 960, 1600], width: 1600, height: 900 },
  { slug: 'dsc08221', widths: [480, 960, 1600], width: 1600, height: 1069 },
  { slug: 'dsc0e0107', widths: [480, 960, 1600], width: 1600, height: 900 },
  { slug: 'dsc0e0147', widths: [480, 960, 1600], width: 1600, height: 900 },
  { slug: 'dsc0e0185', widths: [480, 960, 1600], width: 1600, height: 900 },
  { slug: 'dsc0e0193', widths: [480, 960, 1600], width: 1600, height: 900 },
  { slug: 'dsc0e0297', widths: [480, 960, 1600], width: 1600, height: 900 },
  { slug: 'dsc0e3968', widths: [480, 960, 1600], width: 1600, height: 900 },
  { slug: 'dsc0e8152', widths: [480, 960, 1600], width: 1600, height: 1069 },
  { slug: 'foto-1', widths: [480, 960, 1600], width: 1600, height: 1066 },
  { slug: 'foto-10', widths: [480, 960, 1600], width: 1600, height: 1066 },
  { slug: 'foto-11', widths: [480, 960, 1600], width: 1600, height: 1066 },
  { slug: 'foto-12', widths: [480, 960, 1600], width: 1600, height: 1066 },
  { slug: 'foto-13', widths: [480, 960, 1600], width: 1600, height: 1066 },
  { slug: 'foto-14', widths: [480, 960, 1600], width: 1600, height: 1066 },
  { slug: 'foto-15', widths: [480, 960, 1600], width: 1600, height: 1066 },
  { slug: 'foto-16', widths: [480, 960, 1600], width: 1600, height: 1066 },
  { slug: 'foto-17', widths: [480, 960, 1600], width: 1600, height: 1066 },
  { slug: 'foto-2', widths: [480, 960, 1600], width: 1600, height: 1066 },
  { slug: 'foto-2-1', widths: [480, 960, 1600], width: 1600, height: 1066 },
  { slug: 'foto-3', widths: [480, 960, 1600], width: 1600, height: 1066 },
  { slug: 'foto-3-1', widths: [480, 960, 1600], width: 1600, height: 1066 },
  { slug: 'foto-4', widths: [480, 960, 1600], width: 1600, height: 1066 },
  { slug: 'foto-4-1', widths: [480, 960, 1600], width: 1600, height: 1066 },
  { slug: 'foto-497847662', widths: [480, 960], width: 960, height: 720 },
  { slug: 'foto-5', widths: [480, 960, 1600], width: 1600, height: 1066 },
  { slug: 'foto-5-1', widths: [480, 960, 1600], width: 1600, height: 1066 },
  { slug: 'foto-6', widths: [480, 960, 1600], width: 1600, height: 1066 },
  { slug: 'foto-6-1', widths: [480, 960, 1600], width: 1600, height: 1066 },
  { slug: 'foto-7', widths: [480, 720, 960, 1600], width: 1600, height: 1066 },
  { slug: 'foto-8', widths: [480, 960, 1600], width: 1600, height: 1066 },
  { slug: 'foto-9', widths: [480, 960, 1600], width: 1600, height: 1066 },
  { slug: 'img-0164', widths: [480, 960, 1600], width: 1600, height: 1200 },
  { slug: 'img-0428', widths: [480, 960, 1600], width: 1600, height: 1068 },
  { slug: 'img-0753', widths: [480, 960], width: 960, height: 1280 },
  { slug: 'img-2002', widths: [480, 960, 1600], width: 1600, height: 1067 },
  { slug: 'img-2566', widths: [480, 960], width: 960, height: 1280 },
  { slug: 'img-2616', widths: [480, 960, 1600], width: 1600, height: 1067 },
  { slug: 'img-2852', widths: [480, 960, 1600], width: 1600, height: 1200 },
  { slug: 'img-2999', widths: [480, 960, 1600], width: 1600, height: 1200 },
  { slug: 'img-3729', widths: [480, 960, 1600], width: 1600, height: 1200 },
  { slug: 'img-7041', widths: [480, 960, 1600], width: 1600, height: 1243 },
  { slug: 'img-e5609', widths: [480, 960, 1600], width: 1600, height: 1066 },
  { slug: 'jedzenie', widths: [268], width: 268, height: 299 },
  { slug: 'kobiecy-weekend-uniejow', widths: [480, 960], width: 960, height: 640 },
  { slug: 'konferencja-gosciniec', widths: [480], width: 480, height: 480 },
  { slug: 'konferencje-uniejow-gosciniec', widths: [480], width: 480, height: 480 },
  { slug: 'konferencje-uniejow-gosciniec2', widths: [480], width: 480, height: 480 },
  { slug: 'konferencje-uniejow-gosciniec3', widths: [480], width: 480, height: 480 },
  { slug: 'lokalizacja-gu', widths: [480], width: 480, height: 480 },
  { slug: 'pokoj-1', widths: [480, 960, 1600], width: 1600, height: 1066 },
  { slug: 'pokoj-3', widths: [480, 960, 1600], width: 1600, height: 1066 },
  { slug: 'poznaj-nas', widths: [409], width: 409, height: 441 },
  { slug: 'slider-4z2', widths: [480, 960, 1600], width: 1600, height: 431 },
  { slug: 'spa', widths: [268], width: 268, height: 299 },
  { slug: 'termy', widths: [268], width: 268, height: 299 },
] as const satisfies readonly ImageEntry[];

export type ImageSlug = (typeof images)[number]['slug'];
