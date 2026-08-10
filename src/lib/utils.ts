import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Car names often already embed their year ("Lotus 1964") — avoid printing it twice. */
export function carLabel(name: string, year: number) {
  return name.includes(String(year)) ? name : `${name} ${year}`;
}

