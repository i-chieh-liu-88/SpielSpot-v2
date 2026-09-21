import climbingImage from "../image/image-climbing.png";
import dinosaurImage from "../image/image-dinosour.png";
import ferryWheelImage from "../image/image-ferrywheel.png";
import mapImage from "../image/image-map.png";
import targetImage from "../image/image-target.png";
import treehouseImage from "../image/image-treehouse.png";
import waterfallImage from "../image/image-waterfall.png";
import type { Feature, Playground, Review } from "../types/content";

export const steps = [
  {
    number: "01",
    image: targetImage,
    title: "Tell us where",
    description:
      "Enter a city, postcode, or use your current location to start exploring.",
  },
  {
    number: "02",
    image: mapImage,
    title: "Explore your options",
    description:
      "Compare nearby playgrounds by facilities, ages, safety, and parent ratings.",
  },
  {
    number: "03",
    image: ferryWheelImage,
    title: "Go play!",
    description:
      "Pick the right spot, get directions, and make a brilliant day of it.",
  },
] as const;

export const features: Feature[] = [
  {
    icon: "location",
    title: "Location Search",
    description:
      "Find great playgrounds by street, postcode, or your live location.",
    tone: "bg-green-100",
  },
  {
    icon: "filters",
    title: "Smart Filters",
    description:
      "Narrow results by age, equipment, accessibility, distance, and rating.",
    tone: "bg-sky-100",
  },
  {
    icon: "map",
    title: "Interactive Map",
    description:
      "See nearby spots at a glance with practical travel distances.",
    tone: "bg-amber-100",
  },
  {
    icon: "safety",
    title: "Safety Ratings",
    description:
      "Check fencing, surfaces, lighting, and equipment before you leave.",
    tone: "bg-red-100",
  },
  {
    icon: "age",
    title: "Age Suitability",
    description:
      "Quickly discover spaces that work for toddlers through big kids.",
    tone: "bg-purple-100",
  },
  {
    icon: "accessibility",
    title: "Accessibility Info",
    description:
      "Know where to find ramps, adaptive swings, and smooth pathways.",
    tone: "bg-teal-100",
  },
];

type PlaygroundSeed = Omit<Playground, "image" | "gradient" | "reviews">;

const playgroundImages = [
  treehouseImage,
  waterfallImage,
  climbingImage,
  dinosaurImage,
] as const;

const playgroundGradients = [
  "from-green-200 to-emerald-500",
  "from-sky-300 to-blue-500",
  "from-amber-300 to-orange-400",
  "from-purple-200 to-fuchsia-400",
] as const;

const additionalPlaygroundSeeds: PlaygroundSeed[] = [
  {
    id: "alaunpark-abenteuerplatz",
    name: "Alaunpark Abenteuerplatz",
    location: "Neustadt, Dresden",
    postcode: "01099",
    coordinates: [51.0665, 13.7596],
    distance: "1.1 km",
    rating: "4.7",
    safetyRating: "Very good · 4.6/5",
    ageRange: "Ages 3–11",
    description:
      "A spacious neighbourhood playground with climbing frames, sand play, and lawns for family picnics.",
    tags: ["Climbing", "Sand play", "Picnic area", "Open lawn"],
  },
  {
    id: "clara-zetkin-spielwiese",
    name: "Clara-Zetkin Spielwiese",
    location: "Zentrum-Süd, Leipzig",
    postcode: "04107",
    coordinates: [51.3312, 12.3599],
    distance: "1.4 km",
    rating: "4.8",
    safetyRating: "Excellent · 4.8/5",
    ageRange: "Ages 2–10",
    description:
      "A green park playground with toddler equipment, wide paths, and shaded benches beside the play area.",
    tags: ["Toddler area", "Shade", "Benches", "Accessible"],
  },
  {
    id: "suedpark-bewegungsplatz",
    name: "Südpark Bewegungsplatz",
    location: "Marienburg, Cologne",
    postcode: "50968",
    coordinates: [50.9027, 6.9632],
    distance: "2.0 km",
    rating: "4.6",
    safetyRating: "Very good · 4.5/5",
    ageRange: "Ages 4–12",
    description:
      "An active play space featuring rope climbing, balancing elements, and room for ball games.",
    tags: ["Rope course", "Balance course", "Ball games", "Benches"],
  },
  {
    id: "grueneburg-kinderspielplatz",
    name: "Grüneburg Kinderspielplatz",
    location: "Westend, Frankfurt",
    postcode: "60323",
    coordinates: [50.1253, 8.6566],
    distance: "1.7 km",
    rating: "4.8",
    safetyRating: "Excellent · 4.7/5",
    ageRange: "Ages 2–12",
    description:
      "A leafy playground with separate toddler and climbing zones surrounded by mature park trees.",
    tags: ["Toddler area", "Climbing", "Shade", "Toilets"],
  },
  {
    id: "schlossgarten-spielinsel",
    name: "Schlossgarten Spielinsel",
    location: "Mitte, Stuttgart",
    postcode: "70173",
    coordinates: [48.7834, 9.1854],
    distance: "0.9 km",
    rating: "4.5",
    safetyRating: "Very good · 4.5/5",
    ageRange: "Ages 3–10",
    description:
      "A central play island with slides, swings, and convenient seating close to public transport.",
    tags: ["Slides", "Swings", "Benches", "Public transport"],
  },
  {
    id: "westpark-klettergarten",
    name: "Westpark Klettergarten",
    location: "Kreuzviertel, Dortmund",
    postcode: "44139",
    coordinates: [51.507, 7.4513],
    distance: "1.3 km",
    rating: "4.6",
    safetyRating: "Very good · 4.6/5",
    ageRange: "Ages 5–13",
    description:
      "A climbing-focused playground with nets, towers, and grassy areas for breaks between activities.",
    tags: ["Climbing", "Rope course", "Open lawn", "Benches"],
  },
  {
    id: "hofgarten-spielterrasse",
    name: "Hofgarten Spielterrasse",
    location: "Pempelfort, Düsseldorf",
    postcode: "40211",
    coordinates: [51.2297, 6.7894],
    distance: "1.0 km",
    rating: "4.7",
    safetyRating: "Excellent · 4.7/5",
    ageRange: "Ages 2–9",
    description:
      "A compact city playground with soft surfacing, inclusive equipment, and plenty of nearby shade.",
    tags: ["Accessible", "Soft surface", "Shade", "Toddler area"],
  },
  {
    id: "grugapark-wasserspielplatz",
    name: "Grugapark Wasserspielplatz",
    location: "Rüttenscheid, Essen",
    postcode: "45131",
    coordinates: [51.4303, 6.9967],
    distance: "2.4 km",
    rating: "4.9",
    safetyRating: "Excellent · 4.8/5",
    ageRange: "Ages 2–11",
    description:
      "A large seasonal water-play area with channels, pumps, sand, and family facilities nearby.",
    tags: ["Water play", "Sand play", "Toilets", "Picnic area"],
  },
  {
    id: "buergerpark-naturspielplatz",
    name: "Bürgerpark Naturspielplatz",
    location: "Schwachhausen, Bremen",
    postcode: "28209",
    coordinates: [53.0888, 8.8233],
    distance: "1.8 km",
    rating: "4.8",
    safetyRating: "Excellent · 4.7/5",
    ageRange: "Ages 3–12",
    description:
      "A nature-inspired playground with timber structures, sand, and trails through a peaceful city park.",
    tags: ["Nature play", "Climbing", "Sand play", "Shade"],
  },
  {
    id: "eilenriede-waldspielplatz",
    name: "Eilenriede Waldspielplatz",
    location: "Zoo, Hanover",
    postcode: "30175",
    coordinates: [52.3766, 9.7614],
    distance: "2.1 km",
    rating: "4.7",
    safetyRating: "Very good · 4.6/5",
    ageRange: "Ages 3–12",
    description:
      "A shaded woodland playground with adventurous climbing equipment and nearby walking routes.",
    tags: ["Woodland", "Climbing", "Shade", "Walking paths"],
  },
  {
    id: "woehrder-wiesen-spielplatz",
    name: "Wöhrder Wiesen Spielplatz",
    location: "Wöhrd, Nuremberg",
    postcode: "90489",
    coordinates: [49.4562, 11.0971],
    distance: "1.6 km",
    rating: "4.6",
    safetyRating: "Very good · 4.5/5",
    ageRange: "Ages 2–10",
    description:
      "A lakeside playground with broad lawns, slides, swings, and level paths suitable for pushchairs.",
    tags: ["Lakeside", "Swings", "Slides", "Accessible"],
  },
  {
    id: "schlosspark-spielstation",
    name: "Schlosspark Spielstation",
    location: "Innenstadt-West, Karlsruhe",
    postcode: "76131",
    coordinates: [49.0165, 8.4044],
    distance: "1.2 km",
    rating: "4.7",
    safetyRating: "Excellent · 4.7/5",
    ageRange: "Ages 3–11",
    description:
      "A family-friendly park stop with climbing towers, a sand zone, and many nearby picnic spots.",
    tags: ["Climbing", "Sand play", "Picnic area", "Benches"],
  },
  {
    id: "auwald-entdeckerplatz",
    name: "Auwald Entdeckerplatz",
    location: "Innenstadt, Augsburg",
    postcode: "86150",
    coordinates: [48.3605, 10.8978],
    distance: "1.5 km",
    rating: "4.5",
    safetyRating: "Very good · 4.5/5",
    ageRange: "Ages 4–12",
    description:
      "An exploration-themed playground with timber obstacles, balance beams, and natural play materials.",
    tags: ["Nature play", "Balance course", "Climbing", "Open lawn"],
  },
  {
    id: "aasee-familienspielplatz",
    name: "Aasee Familienspielplatz",
    location: "Sentrup, Münster",
    postcode: "48149",
    coordinates: [51.9563, 7.6052],
    distance: "1.9 km",
    rating: "4.8",
    safetyRating: "Excellent · 4.8/5",
    ageRange: "Ages 2–12",
    description:
      "A popular lakeside family area with equipment for varied ages and generous space for picnics.",
    tags: ["Lakeside", "Toddler area", "Picnic area", "Toilets"],
  },
  {
    id: "sanssouci-kinderspielgarten",
    name: "Sanssouci Kinderspielgarten",
    location: "Brandenburger Vorstadt, Potsdam",
    postcode: "14469",
    coordinates: [52.4022, 13.0439],
    distance: "2.2 km",
    rating: "4.6",
    safetyRating: "Very good · 4.6/5",
    ageRange: "Ages 3–10",
    description:
      "A calm green playground with traditional equipment, shaded seating, and family cycling routes nearby.",
    tags: ["Shade", "Swings", "Slides", "Cycling routes"],
  },
  {
    id: "nordpark-spielarena",
    name: "Nordpark Spielarena",
    location: "Gellershagen, Bielefeld",
    postcode: "33615",
    coordinates: [52.0343, 8.5164],
    distance: "1.7 km",
    rating: "4.5",
    safetyRating: "Very good · 4.4/5",
    ageRange: "Ages 4–13",
    description:
      "An open play arena with a rope pyramid, sports areas, and seating around the main equipment.",
    tags: ["Rope course", "Sports area", "Benches", "Open lawn"],
  },
  {
    id: "luisenpark-spielwelt",
    name: "Luisenpark Spielwelt",
    location: "Oststadt, Mannheim",
    postcode: "68165",
    coordinates: [49.4815, 8.4973],
    distance: "2.0 km",
    rating: "4.9",
    safetyRating: "Excellent · 4.8/5",
    ageRange: "Ages 2–12",
    description:
      "A varied play world combining climbing, water features, toddler equipment, and family rest areas.",
    tags: ["Water play", "Climbing", "Toddler area", "Toilets"],
  },
  {
    id: "seepark-abenteuerspielplatz",
    name: "Seepark Abenteuerspielplatz",
    location: "Betzenhausen, Freiburg",
    postcode: "79110",
    coordinates: [48.0101, 7.8179],
    distance: "2.3 km",
    rating: "4.8",
    safetyRating: "Excellent · 4.7/5",
    ageRange: "Ages 3–12",
    description:
      "A scenic adventure playground with climbing, sand, and open space beside the park lake.",
    tags: ["Lakeside", "Climbing", "Sand play", "Picnic area"],
  },
  {
    id: "rheinaue-spielhuegel",
    name: "Rheinaue Spielhügel",
    location: "Hochkreuz, Bonn",
    postcode: "53175",
    coordinates: [50.7115, 7.1439],
    distance: "2.6 km",
    rating: "4.7",
    safetyRating: "Very good · 4.7/5",
    ageRange: "Ages 3–13",
    description:
      "A broad park playground with play hills, long slides, climbing structures, and picnic lawns.",
    tags: ["Slides", "Climbing", "Picnic area", "Open lawn"],
  },
  {
    id: "volkspark-wassergarten",
    name: "Volkspark Wassergarten",
    location: "Weisenau, Mainz",
    postcode: "55131",
    coordinates: [49.984, 8.2862],
    distance: "1.8 km",
    rating: "4.6",
    safetyRating: "Very good · 4.5/5",
    ageRange: "Ages 2–10",
    description:
      "A seasonal water and sand playground with pumps, channels, and shaded places for supervising adults.",
    tags: ["Water play", "Sand play", "Shade", "Benches"],
  },
  {
    id: "schrevenpark-spielbucht",
    name: "Schrevenpark Spielbucht",
    location: "Schreventeich, Kiel",
    postcode: "24116",
    coordinates: [54.3254, 10.1245],
    distance: "1.4 km",
    rating: "4.7",
    safetyRating: "Excellent · 4.7/5",
    ageRange: "Ages 2–11",
    description:
      "A sheltered urban playground with modern climbing equipment, swings, and accessible park paths.",
    tags: ["Climbing", "Swings", "Accessible", "Shade"],
  },
  {
    id: "stadtpark-kletterwiese",
    name: "Stadtpark Kletterwiese",
    location: "Innenstadt, Bochum",
    postcode: "44791",
    coordinates: [51.4916, 7.2235],
    distance: "1.3 km",
    rating: "4.5",
    safetyRating: "Very good · 4.5/5",
    ageRange: "Ages 4–12",
    description:
      "A green climbing area with rope structures, balance challenges, and room to run between activities.",
    tags: ["Rope course", "Balance course", "Open lawn", "Benches"],
  },
  {
    id: "nordsternpark-spielwerk",
    name: "Nordsternpark Spielwerk",
    location: "Horst, Gelsenkirchen",
    postcode: "45899",
    coordinates: [51.5369, 7.0304],
    distance: "2.7 km",
    rating: "4.6",
    safetyRating: "Very good · 4.6/5",
    ageRange: "Ages 3–12",
    description:
      "An industrial-themed play area with tall slides, climbing nets, and wide riverside paths.",
    tags: ["Slides", "Climbing", "Riverside", "Cycling routes"],
  },
  {
    id: "westpark-familienplatz",
    name: "Westpark Familienplatz",
    location: "Hörn, Aachen",
    postcode: "52074",
    coordinates: [50.7802, 6.0737],
    distance: "1.6 km",
    rating: "4.7",
    safetyRating: "Excellent · 4.7/5",
    ageRange: "Ages 2–11",
    description:
      "A centrally located family playground with toddler features, climbing, and fenced boundaries.",
    tags: ["Fenced", "Toddler area", "Climbing", "Benches"],
  },
  {
    id: "donaupark-bewegungsinsel",
    name: "Donaupark Bewegungsinsel",
    location: "Weichs, Regensburg",
    postcode: "93059",
    coordinates: [49.0255, 12.0993],
    distance: "2.0 km",
    rating: "4.6",
    safetyRating: "Very good · 4.5/5",
    ageRange: "Ages 4–13",
    description:
      "A movement-focused playground with obstacles, climbing nets, and paths along the Danube green spaces.",
    tags: ["Balance course", "Climbing", "Riverside", "Cycling routes"],
  },
  {
    id: "kurpark-spielpavillon",
    name: "Kurpark Spielpavillon",
    location: "Sonnenberg, Wiesbaden",
    postcode: "65189",
    coordinates: [50.0865, 8.2532],
    distance: "1.5 km",
    rating: "4.7",
    safetyRating: "Excellent · 4.7/5",
    ageRange: "Ages 2–10",
    description:
      "A well-kept park playground with soft surfacing, classic equipment, shade, and smooth approaches.",
    tags: ["Soft surface", "Accessible", "Shade", "Swings"],
  },
  {
    id: "kaisergarten-tierparkplatz",
    name: "Kaisergarten Tierparkplatz",
    location: "Alstaden, Oberhausen",
    postcode: "46049",
    coordinates: [51.4898, 6.8364],
    distance: "2.2 km",
    rating: "4.8",
    safetyRating: "Excellent · 4.8/5",
    ageRange: "Ages 2–12",
    description:
      "A family destination with varied play equipment, picnic seating, and animal-themed surroundings.",
    tags: ["Animal theme", "Toddler area", "Picnic area", "Toilets"],
  },
  {
    id: "buergerpark-spielterrassen",
    name: "Bürgerpark Spielterrassen",
    location: "Alt-Saarbrücken, Saarbrücken",
    postcode: "66117",
    coordinates: [49.2332, 6.9824],
    distance: "1.1 km",
    rating: "4.5",
    safetyRating: "Very good · 4.4/5",
    ageRange: "Ages 3–11",
    description:
      "A terraced city playground with climbing and balancing equipment near riverside walking paths.",
    tags: ["Climbing", "Balance course", "Riverside", "Benches"],
  },
  {
    id: "stadtpark-hansespielplatz",
    name: "Stadtpark Hansespielplatz",
    location: "St. Jürgen, Lübeck",
    postcode: "23564",
    coordinates: [53.8575, 10.6933],
    distance: "1.8 km",
    rating: "4.6",
    safetyRating: "Very good · 4.6/5",
    ageRange: "Ages 2–11",
    description:
      "A neighbourhood playground with a ship theme, sand equipment, swings, and shaded family seating.",
    tags: ["Ship theme", "Sand play", "Swings", "Shade"],
  },
  {
    id: "kuechwald-abenteuerwiese",
    name: "Küchwald Abenteuerwiese",
    location: "Schloßchemnitz, Chemnitz",
    postcode: "09113",
    coordinates: [50.8429, 12.8995],
    distance: "2.1 km",
    rating: "4.7",
    safetyRating: "Excellent · 4.7/5",
    ageRange: "Ages 3–12",
    description:
      "A woodland-edge adventure area with climbing towers, long slides, and generous picnic lawns.",
    tags: ["Woodland", "Climbing", "Slides", "Picnic area"],
  },
];

const additionalPlaygrounds: Playground[] = additionalPlaygroundSeeds.map(
  (playground, index) => ({
    ...playground,
    image: playgroundImages[index % playgroundImages.length],
    gradient: playgroundGradients[index % playgroundGradients.length],
    reviews: [
      {
        id: `${playground.id}-1`,
        author: "SpielSpot community",
        rating: Math.round(Number(playground.rating)),
        text: `Families recommend ${playground.name} for its ${playground.tags
          .slice(0, 2)
          .join(" and ")
          .toLowerCase()}.`,
        visitedAt: "July 2026",
      },
    ],
  }),
);

export const playgrounds: Playground[] = [
  {
    id: "wald-abenteuerplatz",
    name: "Wald Abenteuerplatz",
    location: "Kreuzberg, Berlin",
    postcode: "10997",
    coordinates: [52.4986, 13.4033],
    distance: "0.8 km",
    rating: "4.9",
    safetyRating: "Excellent · 4.8/5",
    ageRange: "Ages 3–10",
    description:
      "A leafy adventure playground with climbing towers, sand areas, shaded seating, and a secure fenced boundary.",
    image: treehouseImage,
    gradient: "from-green-200 to-emerald-500",
    tags: ["Fenced", "Climbing", "Shade", "Sand play"],
    reviews: [
      {
        id: "wald-1",
        author: "Sarah M.",
        rating: 5,
        text: "The fencing and shade make this an easy choice for a relaxed family afternoon.",
        visitedAt: "June 2026",
      },
      {
        id: "wald-2",
        author: "Jonas K.",
        rating: 5,
        text: "Great climbing equipment and enough variety for both of our children.",
        visitedAt: "May 2026",
      },
    ],
  },
  {
    id: "wasser-spielgarten",
    name: "Wasser Spielgarten",
    location: "Altona, Hamburg",
    postcode: "22765",
    coordinates: [53.5516, 9.9352],
    distance: "1.2 km",
    rating: "4.8",
    safetyRating: "Very good · 4.7/5",
    ageRange: "Ages 2–9",
    description:
      "An inclusive water-play garden with smooth pathways, pumps, channels, and plenty of space for warm-weather play.",
    image: waterfallImage,
    gradient: "from-sky-300 to-blue-500",
    tags: ["Water play", "Accessible", "Toilets", "Benches"],
    reviews: [
      {
        id: "wasser-1",
        author: "Thomas K.",
        rating: 5,
        text: "The accessible paths are excellent and the water equipment kept everyone busy.",
        visitedAt: "July 2026",
      },
      {
        id: "wasser-2",
        author: "Mina R.",
        rating: 4,
        text: "Lovely on a hot day. Bring spare clothes because the children will get soaked.",
        visitedAt: "June 2026",
      },
    ],
  },
  {
    id: "kletter-insel",
    name: "Kletter Insel",
    location: "Schwabing, Munich",
    postcode: "80802",
    coordinates: [48.1642, 11.5861],
    distance: "1.5 km",
    rating: "4.7",
    safetyRating: "Very good · 4.6/5",
    ageRange: "Ages 5–12",
    description:
      "A challenging climbing-focused playground with rope structures, balancing obstacles, and a nearby family picnic lawn.",
    image: climbingImage,
    gradient: "from-amber-300 to-orange-400",
    tags: ["Climbing", "Picnic area", "Balance course", "Open lawn"],
    reviews: [
      {
        id: "kletter-1",
        author: "Laura B.",
        rating: 5,
        text: "Perfect for confident climbers and there is a good picnic area for parents.",
        visitedAt: "June 2026",
      },
      {
        id: "kletter-2",
        author: "David S.",
        rating: 4,
        text: "Well maintained and fun, though younger toddlers may need another play area.",
        visitedAt: "April 2026",
      },
    ],
  },
  ...additionalPlaygrounds,
];

export const reviews: Review[] = [
  {
    quote:
      "SpielSpot has completely changed our weekends. I can finally check whether a playground is fenced before we set off.",
    name: "Sarah M.",
    detail: "Mum of 2 · Berlin",
    initials: "SM",
    tone: "bg-green-200 text-green-700",
  },
  {
    quote:
      "The age filters are excellent. We found a place where my toddler and older child were both genuinely happy.",
    name: "Thomas K.",
    detail: "Dad of 1 · Hamburg",
    initials: "TK",
    tone: "bg-sky-200 text-sky-700",
  },
  {
    quote:
      "Recent photos and honest local reviews make planning an outing so much easier when we visit a new city.",
    name: "Laura B.",
    detail: "Mum of 3 · Munich",
    initials: "LB",
    tone: "bg-amber-200 text-amber-700",
  },
];

export { dinosaurImage };
