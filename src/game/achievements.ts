export type Achievement = {
  id: string;
  icon: string;
  name: string;
  desc: string;
  secret: boolean;
};

export const achievements: Achievement[] = [
  {
    id: "world_champion",
    icon: "🏆",
    name: "World Champion",
    desc: "Win your first championship.",
    secret: false,
  },
  { id: "god_tier", icon: "👑", name: "God Tier", desc: "Roll a 195+ package.", secret: false },
  { id: "oh_dear", icon: "💩", name: "Oh Dear...", desc: "Roll a package below 140.", secret: false },
  {
    id: "how",
    icon: "🤯",
    name: "HOW?!",
    desc: "Win a championship with a package below 160.",
    secret: false,
  },
  {
    id: "shiny",
    icon: "✨",
    name: "Shiny!",
    desc: "Find your first shiny driver or car.",
    secret: false,
  },
  {
    id: "double_shiny",
    icon: "🌈",
    name: "Double Shiny",
    desc: "Roll a shiny driver AND shiny car in the same run.",
    secret: false,
  },
  {
    id: "holy_grail",
    icon: "💎",
    name: "Holy Grail",
    desc: "Find a shiny driver or car rated 95+.",
    secret: false,
  },
  {
    id: "dream_team",
    icon: "🐐",
    name: "Dream Team",
    desc: "Pair a 95+ driver with a 95+ car.",
    secret: false,
  },
  {
    id: "heartbreak",
    icon: "🥈",
    name: "Heartbreak",
    desc: "Lose the championship by 3 points or fewer.",
    secret: false,
  },
  {
    id: "pain",
    icon: "🔧",
    name: "Pain.",
    desc: "Lose the championship after a DNF in the final race.",
    secret: false,
  },
  { id: "perfect", icon: "🏁", name: "Perfect Season", desc: "Win all 24 races.", secret: false },
  {
    id: "dominant",
    icon: "🔥",
    name: "Dominant",
    desc: "Win 15 or more races in one season.",
    secret: false,
  },
  {
    id: "dragging",
    icon: "🐌",
    name: "Dragging It Along",
    desc: "Score a podium with a package below 150.",
    secret: false,
  },
  {
    id: "collector",
    icon: "📚",
    name: "Collector",
    desc: "Discover 100 Formula Archive cards.",
    secret: false,
  },
  {
    id: "archivist",
    icon: "🗄️",
    name: "Archivist",
    desc: "Discover 250 Formula Archive cards.",
    secret: false,
  },
  {
    id: "touch_grass",
    icon: "🌱",
    name: "Touch Grass",
    desc: "Complete 100 seasons.",
    secret: false,
  },
  {
    id: "photo_finish",
    icon: "📸",
    name: "Photo Finish",
    desc: "Win the championship by 1 point.",
    secret: true,
  },
  {
    id: "zero_hero",
    icon: "🪄",
    name: "From Nowhere",
    desc: "Win a race after starting the season ranked P15 or worse on paper.",
    secret: true,
  },
  {
    id: "clean_sweep",
    icon: "🧹",
    name: "Untouchable",
    desc: "Win a championship without a single DNF.",
    secret: true,
  },
  {
    id: "shiny_champ",
    icon: "🌟",
    name: "Golden Run",
    desc: "Win a championship with at least one shiny in your combo.",
    secret: true,
  },
];

export const achievementById = (id: string) => achievements.find((a) => a.id === id);
