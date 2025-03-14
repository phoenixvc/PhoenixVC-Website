// constants/tokens/grid.ts

// Grid template columns
export const gridTemplateColumns = {
    none: "none",
    1: "repeat(1, minmax(0, 1fr))",
    2: "repeat(2, minmax(0, 1fr))",
    3: "repeat(3, minmax(0, 1fr))",
    4: "repeat(4, minmax(0, 1fr))",
    5: "repeat(5, minmax(0, 1fr))",
    6: "repeat(6, minmax(0, 1fr))",
    7: "repeat(7, minmax(0, 1fr))",
    8: "repeat(8, minmax(0, 1fr))",
    9: "repeat(9, minmax(0, 1fr))",
    10: "repeat(10, minmax(0, 1fr))",
    11: "repeat(11, minmax(0, 1fr))",
    12: "repeat(12, minmax(0, 1fr))",
  } as const;

  // Grid template rows
  export const gridTemplateRows = {
    none: "none",
    1: "repeat(1, minmax(0, 1fr))",
    2: "repeat(2, minmax(0, 1fr))",
    3: "repeat(3, minmax(0, 1fr))",
    4: "repeat(4, minmax(0, 1fr))",
    5: "repeat(5, minmax(0, 1fr))",
    6: "repeat(6, minmax(0, 1fr))",
  } as const;

  // Grid auto flow
  export const gridAutoFlow = {
    row: "row",
    col: "column",
    rowDense: "row dense",
    colDense: "column dense",
  } as const;

  // Grid auto columns
  export const gridAutoColumns = {
    auto: "auto",
    min: "min-content",
    max: "max-content",
    fr: "minmax(0, 1fr)",
  } as const;

  // Grid auto rows
  export const gridAutoRows = {
    auto: "auto",
    min: "min-content",
    max: "max-content",
    fr: "minmax(0, 1fr)",
  } as const;

  // Grid column start/end
  export const gridColumn = {
    auto: "auto",
    "span-1": "span 1 / span 1",
    "span-2": "span 2 / span 2",
    "span-3": "span 3 / span 3",
    "span-4": "span 4 / span 4",
    "span-5": "span 5 / span 5",
    "span-6": "span 6 / span 6",
    "span-7": "span 7 / span 7",
    "span-8": "span 8 / span 8",
    "span-9": "span 9 / span 9",
    "span-10": "span 10 / span 10",
    "span-11": "span 11 / span 11",
    "span-12": "span 12 / span 12",
    "span-full": "1 / -1",
  } as const;

  // Grid row start/end
  export const gridRow = {
    auto: "auto",
    "span-1": "span 1 / span 1",
    "span-2": "span 2 / span 2",
    "span-3": "span 3 / span 3",
    "span-4": "span 4 / span 4",
    "span-5": "span 5 / span 5",
    "span-6": "span 6 / span 6",
    "span-full": "1 / -1",
  } as const;

  // Grid gap
  export const gridGap = {
    0: "0px",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem",
  } as const;

  // Common grid layouts
  export const gridLayouts = {
    basic: {
      columns: gridTemplateColumns[12],
      rows: gridTemplateRows.none,
      gap: gridGap[4],
    },
    cards: {
      columns: "repeat(auto-fill, minmax(250px, 1fr))",
      rows: gridTemplateRows.none,
      gap: gridGap[4],
    },
    gallery: {
      columns: "repeat(auto-fill, minmax(200px, 1fr))",
      rows: gridTemplateRows.none,
      gap: gridGap[2],
    },
    dashboard: {
      columns: "repeat(12, minmax(0, 1fr))",
      rows: "auto 1fr auto",
      gap: gridGap[4],
    },
  } as const;
