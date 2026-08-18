/**
 * Contact configuration — prefer values from .env.local locally,
 * otherwise use the Firebase/App Hosting environment values.
 */
const getStringEnv = (key: string, fallback = "") => {
  return (process.env[key] ?? fallback).toString();
};

const getBooleanEnv = (key: string, fallback = false) => {
  const value = process.env[key];
  if (value == null) return fallback;
  return value === "true" || value === "1" || value === "TRUE";
};

export const siteConfig = {
  name: getStringEnv("NEXT_PUBLIC_NAME", "Portfolio"),
  roadmapUsername: getStringEnv("NEXT_PUBLIC_ROADMAP_USERNAME"),
  isAvatarLocal: getBooleanEnv("NEXT_PUBLIC_IS_AVATAR_LOCAL", false),
  avatarPath: getStringEnv("NEXT_PUBLIC_AVATAR_PATH"),
  avatarUrl: getStringEnv("NEXT_PUBLIC_AVATAR_URL"),
} as const;

export const contact = {
  email: getStringEnv("NEXT_PUBLIC_EMAIL"),
  social: {
    github: getStringEnv("NEXT_PUBLIC_GITHUB"),
    linkedin: getStringEnv("NEXT_PUBLIC_LINKEDIN"),
    instagram: getStringEnv("NEXT_PUBLIC_INSTAGRAM"),
    stackoverflow: getStringEnv("NEXT_PUBLIC_STACKOVERFLOW"),
    leetcode: getStringEnv("NEXT_PUBLIC_LEETCODE"),
  },
} as const;
