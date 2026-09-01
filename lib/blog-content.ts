// Full article bodies for the Journal. Kept separate from lib/static-data.ts
// so the (large) copy is only imported by the blog routes, not by every
// client bundle that needs the lightweight blogPosts list.

export interface BlogSection {
  heading: string
  paragraphs: string[]
  list?: string[]
}

export interface BlogArticle {
  slug: string
  date: string // ISO date, used for display and BlogPosting datePublished
  readMinutes: number
  intro: string[]
  sections: BlogSection[]
  cta: { text: string; href: string }
}

export const blogArticles: BlogArticle[] = [
  {
    slug: 'building-a-pet-routine',
    date: '2026-08-12',
    readMinutes: 5,
    intro: [
      'Dogs and cats are creatures of habit. A predictable daily rhythm lowers their stress, cuts down on destructive behavior, and makes everything from vet visits to nail trims easier — because a pet who knows what comes next is a pet who can relax.',
      'The good news: you do not need an extra hour in your day. Fifteen intentional minutes, split into three small rituals, is enough to change how your pet moves through the day.',
    ],
    sections: [
      {
        heading: 'Why routines change behavior',
        paragraphs: [
          'Most "problem" behaviors — chewed shoes, 3 a.m. zoomies, door-dashing — are really energy and anxiety with nowhere to go. A routine gives that energy a schedule. When play, meals, and wind-down happen in a familiar order, pets stop rehearsing the frantic behaviors they use to make things happen.',
          'Routines also build trust. A rescue dog or a shy cat learns far faster from ten predictable minutes every day than from an occasional marathon play session on the weekend.',
        ],
      },
      {
        heading: 'The 5-5-5 framework',
        paragraphs: [
          'Split your fifteen minutes into three anchors: morning, reunion, and evening.',
        ],
        list: [
          'Morning (5 min): feed in the same order every day, then do one tiny training rep — a sit, a touch, a recall to the bowl. One rep, done well, beats a long drill.',
          'Reunion (5 min): the moment you get home carries the most pent-up energy of the day. Burn it on purpose — a hallway fetch burst for dogs, a wand-toy chase for cats — before you settle in.',
          'Evening (5 min): wind down with a puzzle feeder, a lick mat, or slow brushing. Calm activities before bed teach pets that nighttime is for sleeping, not patrol.',
        ],
      },
      {
        heading: 'Rotate, don’t accumulate',
        paragraphs: [
          'Novelty is what makes a toy exciting — and novelty is renewable. Keep a third of the toy basket out at a time and rotate weekly. A ball that vanished for two weeks comes back as a brand-new ball, no purchase required.',
          'This is also the honest case for surprise bundles: a mystery box lands a few genuinely new textures and shapes in the rotation without you having to guess at the pet store.',
        ],
      },
      {
        heading: 'Anchor habits to habits',
        paragraphs: [
          'The easiest way to keep a routine is to attach it to something you already do without thinking. Kettle on → training rep. Shoes off → reunion play. Toothbrush out → puzzle feeder down. Your existing habits become the schedule, so the routine survives busy weeks.',
          'Consistency of order matters more than consistency of clock time. Pets track sequences, not minutes — "play comes after dinner" is a promise you can keep even when dinner runs late.',
        ],
      },
      {
        heading: 'Adjust for life stage',
        paragraphs: [
          'Puppies and kittens do better with shorter, more frequent bursts — three minutes, several times a day. Seniors still want the ritual, just gentler: swap the sprint for a sniffy walk, the leap for a low perch. If your pet’s energy or appetite changes suddenly, skip the schedule tweaks and talk to your vet first.',
        ],
      },
    ],
    cta: { text: 'Build your rotation — shop toys, beds, and puzzle feeders', href: '/shop' },
  },
  {
    slug: 'choosing-safe-materials',
    date: '2026-07-28',
    readMinutes: 6,
    intro: [
      'Here is the uncomfortable truth about pet products: they are regulated far more loosely than children’s toys. There is no mandatory safety standard a dog toy must pass before it reaches a shelf. The burden of judgment falls on brands — and on you.',
      'This is the checklist we use at PawLL before any product earns a listing, written out so you can apply it to anything you buy, from us or anyone else.',
    ],
    sections: [
      {
        heading: 'The regulation gap',
        paragraphs: [
          'Children’s products in the US must meet CPSC rules for lead, phthalates, and small parts. Pet products have no equivalent mandatory standard, even though pets chew harder, swallow faster, and lick longer than any toddler.',
          'That gap is why two toys that look identical online can be completely different products: one molded from food-grade material, the other from recycled plastic of unknown origin with a fresh coat of paint.',
        ],
      },
      {
        heading: 'Materials we accept',
        paragraphs: [
          'We approve a short list of materials with a track record:',
        ],
        list: [
          'Food-grade silicone and natural rubber for chew toys — flexible, resilient, and safe to mouth for hours.',
          'BPA-free, phthalate-free polymers for hard toys and bowls.',
          'Tightly woven, machine-washable fabrics for plush and bedding — loose weaves shed threads that wrap around teeth and gut.',
          'Uncoated, pet-safe dyes. If a color can rub off on a wet cloth, it can rub off on a tongue.',
        ],
      },
      {
        heading: 'What we reject',
        paragraphs: [
          'Cheap PVC softened with plasticizers, paints with lead pigments, brittle plastics that crack into shards, and anything with small parts that detach under a determined bite — squeakers that pop out in seconds, glued-on eyes, decorative bells on thin threads.',
          'We also reject toys that are the wrong size for their marketing. A ball sized for a beagle is a choking hazard when the listing photo shows a mastiff.',
        ],
      },
      {
        heading: 'Size and stitching',
        paragraphs: [
          'Before a plush or tug toy passes, we check double-stitched seams, test the tug strength along every axis, and confirm the toy is too large to swallow for the smallest breed it is marketed to. A toy should fail gracefully — going flat or fuzzy, not splitting into swallowable pieces.',
        ],
      },
      {
        heading: 'Colors your pet actually sees',
        paragraphs: [
          'Dogs see the world in blues and yellows — reds and greens flatten into muddy browns. That is why so much of our catalog leans blue and yellow: your dog can actually track the toy across the grass. It is a small detail, but it is the difference between a fetch toy and a lost toy.',
        ],
      },
      {
        heading: 'Care and replacement',
        paragraphs: [
          'Even safe materials wear out. Wash plush monthly, scrub rubber weekly if it is a daily chewer, and retire any toy with exposed stuffing, deep cracks, or pieces you cannot account for. A retired toy is cheaper than an emergency vet visit — and if you ever suspect your pet swallowed a fragment, call your vet right away.',
        ],
      },
    ],
    cta: { text: 'Read our full product safety standards', href: '/product-safety' },
  },
  {
    slug: 'cat-enrichment-playbook',
    date: '2026-08-20',
    readMinutes: 6,
    intro: [
      'Indoor cats live longer, safer lives — and dramatically more boring ones, unless someone builds them a job. A cat’s job is hunting. Take that away without a substitute and the energy resurfaces as midnight sprints, counter raids, and door-frame renovation.',
      'This playbook rebuilds the hunt indoors in about twenty minutes a day.',
    ],
    sections: [
      {
        heading: 'The hunt-catch-eat cycle',
        paragraphs: [
          'In the wild, a cat’s day is a loop: stalk, chase, catch, eat, groom, sleep. The order matters. Play that ends with a "kill" followed by food completes the loop and produces a calm, satisfied cat. Play that just stops mid-chase leaves the loop open — and an open loop goes looking for your ankles at 3 a.m.',
          'The fix is simple: end every play session by letting the cat catch the toy decisively, then serve a meal or a few treats.',
        ],
      },
      {
        heading: 'Two ten-minute hunts a day',
        paragraphs: [
          'Cats are crepuscular — wired to hunt at dawn and dusk. Schedule one wand-toy session before breakfast and one before dinner. Move the lure like prey: along the floor, behind cover, in short darts with freezes. Let the cat catch it several times, with a final catch before the meal.',
          'Ten focused minutes beats an hour of a bored human waving a stick. When the cat’s hips wiggle and pupils widen, you are doing it right.',
        ],
      },
      {
        heading: 'Puzzle feeding',
        paragraphs: [
          'A bowl empties in ninety seconds; a puzzle feeder turns the same meal into a fifteen-minute foraging project. Start easy so the cat wins early, then raise difficulty. Scatter-feeding a few kibbles around the room works too — it turns the floor into a hunting ground.',
        ],
      },
      {
        heading: 'Territory in 3D',
        paragraphs: [
          'Cats measure territory in vertical layers, not square feet. A climbing tree, a cleared bookshelf route, and one window perch with a view of birds effectively triple an apartment. Every cat in a multi-cat home needs its own high spot — most standoffs are real-estate disputes.',
        ],
      },
      {
        heading: 'Rotate scents and toys',
        paragraphs: [
          'Catnip only works on some cats, and even for them it fades with constant exposure. Alternate catnip with silvervine and honeysuckle, and rest scented toys in a sealed bag between appearances so the scent stays loud. Rotate the toy basket weekly, same as for dogs: a vanished crinkle ball returns as a new one.',
        ],
      },
      {
        heading: 'Signs you’ve got it right',
        paragraphs: [
          'A well-enriched cat initiates play, eats with appetite, sleeps through more of the night, and greets you at the door instead of ambushing you behind it. If behavior changes suddenly — hiding, skipped meals, litter box changes — that is a vet conversation, not an enrichment problem.',
        ],
      },
    ],
    cta: { text: 'Gear up the hunt — shop cat toys and perches', href: '/shop-by-pet' },
  },
]

export function getArticle(slug: string): BlogArticle | undefined {
  return blogArticles.find(a => a.slug === slug)
}
