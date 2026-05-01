import type { PrintOptions } from "./types";

export interface Template {
  id: string;
  name: string;
  description: string;
  emoji: string;
  apply: (current: PrintOptions) => PrintOptions;
}

export const TEMPLATES: Template[] = [
  {
    id: "record",
    name: "Record Print",
    description: "Color first page, B/W rest, spiral bound",
    emoji: "📓",
    apply: (c) => ({ ...c, printType: "color", binding: "spiral", template: "record" }),
  },
  {
    id: "assignment",
    name: "Assignment",
    description: "Black & white, stapled",
    emoji: "📝",
    apply: (c) => ({ ...c, printType: "bw", binding: "staple", template: "assignment" }),
  },
  {
    id: "notes",
    name: "Notes",
    description: "Black & white, no binding",
    emoji: "📄",
    apply: (c) => ({ ...c, printType: "bw", binding: "none", template: "notes" }),
  },
];