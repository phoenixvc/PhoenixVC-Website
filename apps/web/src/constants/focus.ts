// src/constants/focus.ts
export interface FocusArea {
  title: string;
  description: string;
  icon: string;
}

export const FOCUS_AREAS: FocusArea[] = [
  {
    title: "AI & Machine Learning",
    description:
      "Supporting breakthrough innovations in artificial intelligence and machine learning applications.",
    icon: "🤖",
  },
  {
    title: "Blockchain Technology",
    description:
      "Investing in decentralized solutions and Web3 infrastructure.",
    icon: "⛓️",
  },
  {
    title: "Climate Tech",
    description: "Backing sustainable solutions for a greener future.",
    icon: "🌱",
  },
  {
    title: "Healthcare Innovation",
    description: "Advancing digital health and biotechnology solutions.",
    icon: "🏥",
  },
];
