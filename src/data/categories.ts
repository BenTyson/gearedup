export interface Category {
  name: string;
  slug: string;
  description: string;
  metaDescription: string;
  color: string;
  icon: string;
}

export const categories: Category[] = [
  {
    name: 'Quilting',
    slug: 'quilting',
    description: 'Essential gear for quilters, from rotary cutters to sewing machines.',
    metaDescription: 'Find the best quilting gear including rotary cutters, cutting mats, sewing machines, and fabric scissors. Curated recommendations for quilters of all levels.',
    color: 'quilting',
    icon: 'scissors',
  },
  {
    name: 'Board Gaming',
    slug: 'board-gaming',
    description: 'Level up your tabletop experience with the right accessories.',
    metaDescription: 'Discover the best board gaming accessories including card sleeves, storage solutions, playmats, and dice. Expert picks for tabletop enthusiasts.',
    color: 'board-gaming',
    icon: 'dice',
  },
  {
    name: 'Miniature Painting',
    slug: 'miniature-painting',
    description: 'Brushes, paints, and tools for miniature painters.',
    metaDescription: 'Find the best miniature painting supplies including brushes, paints, wet palettes, and magnifying lamps. Gear for hobbyists and pros alike.',
    color: 'miniatures',
    icon: 'brush',
  },
  {
    name: 'Knitting',
    slug: 'knitting',
    description: 'Needles, yarn, and accessories for knitters.',
    metaDescription: 'Discover the best knitting gear including needles, yarn winders, blocking mats, and project bags. Curated picks for knitters at every skill level.',
    color: 'knitting',
    icon: 'yarn',
  },
  {
    name: 'Home Coffee',
    slug: 'home-coffee',
    description: 'Grinders, brewers, and gear for coffee enthusiasts.',
    metaDescription: 'Find the best home coffee equipment including burr grinders, pour-over makers, espresso machines, and kettles. Gear for your perfect cup.',
    color: 'coffee',
    icon: 'coffee',
  },
  {
    name: 'Photography',
    slug: 'photography',
    description: 'Camera gear, accessories, and tools for photographers.',
    metaDescription: 'Find the best photography gear including tripods, camera bags, memory cards, and lighting. Equipment for hobbyists and professionals.',
    color: 'photography',
    icon: 'camera',
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((cat) => cat.slug === slug);
}

export function getCategoryColor(slug: string): string {
  const category = getCategoryBySlug(slug);
  return category?.color || 'brand';
}
