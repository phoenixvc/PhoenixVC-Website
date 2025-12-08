// apps/design-system/src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// TODO: Production hardening:
// 1. Add unit tests for this utility function.

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
