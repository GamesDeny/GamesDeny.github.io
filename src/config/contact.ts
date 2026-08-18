/**
 * Contact configuration — prefer values from .env.local locally,
 * otherwise use the Firebase/App Hosting environment values.
 */
const getPublicEnv = (key: string, fallback = "") => {
  return process.env[key] ?? fallback;
};

export const siteConfig = {
  name: getPublicEnv("NEXT_PUBLIC_NAME", "Your Name"),
  roadmapUsername: getPublicEnv("NEXT_PUBLIC_ROADMAP_USERNAME"),
} as const;

export const contact = {
  email: getPublicEnv("NEXT_PUBLIC_EMAIL"),
  social: {
    github: getPublicEnv("NEXT_PUBLIC_GITHUB"),
    linkedin: getPublicEnv("NEXT_PUBLIC_LINKEDIN"),
    instagram: getPublicEnv("NEXT_PUBLIC_INSTAGRAM"),
    stackoverflow: getPublicEnv("NEXT_PUBLIC_STACKOVERFLOW"),
    leetcode: getPublicEnv("NEXT_PUBLIC_LEETCODE"),
  },
} as const;
