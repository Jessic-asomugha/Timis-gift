export interface TrackerState {
  stage: number; // 1 to 6
  location: string;
  estimatedArrival: string;
  customNote: string;
  lastUpdated: string;
  giftOpened: boolean;
}

export interface StageInfo {
  id: number;
  label: string;
  emoji: string;
  statusTitle: string;
  description: string;
  dogAction: string;
}

export const STAGES: StageInfo[] = [
  {
    id: 1,
    label: "Package Created",
    emoji: "📦",
    statusTitle: "Wrapped and Ready!",
    description: "Jess has carefully wrapped your surprise, tied the ribbons, and sealed it with excitement.",
    dogAction: "sitting beside the package, tail wagging, look of pure anticipation",
  },
  {
    id: 2,
    label: "Picked Up",
    emoji: "🚚",
    statusTitle: "In Transit",
    description: "The package is picked up! It has official tracking status and is moving out of Jess's cozy hub.",
    dogAction: "advancing briskly, sniffing around, guiding the cardboard delivery truck",
  },
  {
    id: 3,
    label: "On The Way",
    emoji: "🛣️",
    statusTitle: "On the Open Road",
    description: "Cruising down the highway, heading in your general geographical direction at full priority speed.",
    dogAction: "running joyfully with floppy ears flapping in the wind",
  },
  {
    id: 4,
    label: "Nearing Destination",
    emoji: "📍",
    statusTitle: "Almost in Your City",
    description: "Arrived at the local sorting station! It's so close you can almost smell the package tape.",
    dogAction: "peeking curiously over a hedge or map, looking forward with big eyes",
  },
  {
    id: 5,
    label: "Almost There",
    emoji: "👀",
    statusTitle: "Out for Delivery",
    description: "In your neighborhood. Keep an eye on your front porch, door, or letterbox! It's imminent.",
    dogAction: "jumping excitedly, tail wagging ultra fast, eager happy barks",
  },
  {
    id: 6,
    label: "Delivered",
    emoji: "🎉",
    statusTitle: "Arrived! 🎁",
    description: "Hooray! The bundle has been successfully delivered. There is a package waiting for you!",
    dogAction: "celebratory loop-de-loops, happy dance, ribbon confetti explosion",
  },
];
