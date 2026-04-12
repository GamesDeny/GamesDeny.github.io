/**
 * Contact configuration — values come from environment variables.
 * Edit .env.local to update without touching source code.
 */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_NAME ?? "Your Name",
  roadmapUsername: process.env.NEXT_PUBLIC_ROADMAP_USERNAME ?? "",
} as const;

export const contact = {
  email: process.env.NEXT_PUBLIC_EMAIL ?? "",
  social: {
    github: process.env.NEXT_PUBLIC_GITHUB,
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN,
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM,
    stackoverflow: process.env.NEXT_PUBLIC_STACKOVERFLOW,
    leetcode: process.env.NEXT_PUBLIC_LEETCODE,
  },
} as const;
