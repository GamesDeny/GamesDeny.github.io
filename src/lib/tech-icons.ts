import {
  siSpring,
  siSpringboot,
  siMysql,
  siDocker,
  siKubernetes,
  siApachekafka,
  siTypescript,
  siPython,
  siGo,
  siPostgresql,
  siRedis,
  siDjango,
  siNodedotjs,
  siGraphql,
  siRust,
  siOpenjdk,
  siRabbitmq,
  siMariadb,
  siGithub,
  siGitlab,
  siJenkins,
  siGradle,
  siReact,
  siNextdotjs,
  siJavascript,
  siAngular,
  siVuedotjs,
  siTailwindcss,
  siGit,
  siLinux,
  siNginx,
  siElasticsearch,
  siMongodb,
  siSqlite,
} from "simple-icons";
import type { SimpleIcon } from "simple-icons";

/**
 * Maps lowercase tag names to a simple-icons icon.
 * Add entries here whenever you add new tags.
 */
const ICON_MAP: Record<string, SimpleIcon> = {
  // JVM
  java:        siOpenjdk,
  openjdk:     siOpenjdk,
  spring:      siSpring,
  springboot:  siSpringboot,
  "spring boot": siSpringboot,
  gradle:      siGradle,

  // Databases
  mysql:       siMysql,
  postgresql:  siPostgresql,
  postgres:    siPostgresql,
  redis:       siRedis,
  mongodb:     siMongodb,
  mariadb:     siMariadb,
  sqlite:      siSqlite,
  elasticsearch: siElasticsearch,

  // Containers / infra
  docker:      siDocker,
  kubernetes:  siKubernetes,
  k8s:         siKubernetes,

  // Messaging
  kafka:       siApachekafka,
  rabbitmq:    siRabbitmq,

  // Languages
  typescript:  siTypescript,
  javascript:  siJavascript,
  python:      siPython,
  go:          siGo,
  golang:      siGo,
  rust:        siRust,

  // Web / frontend
  react:       siReact,
  "next.js":   siNextdotjs,
  nextjs:      siNextdotjs,
  angular:     siAngular,
  "vue.js":    siVuedotjs,
  vuejs:       siVuedotjs,
  tailwindcss: siTailwindcss,
  tailwind:    siTailwindcss,
  graphql:     siGraphql,
  "node.js":   siNodedotjs,
  nodejs:      siNodedotjs,

  // Backend frameworks
  django:      siDjango,

  // DevOps / CI
  git:         siGit,
  github:      siGithub,
  gitlab:      siGitlab,
  jenkins:     siJenkins,
  nginx:       siNginx,
  linux:       siLinux,
};

/** Override brand hex for icons whose official colour is unreadable on dark backgrounds. */
const HEX_OVERRIDES: Record<string, string> = {
  java:        "F89820", // Java orange (OpenJDK official is too dark)
  openjdk:     "F89820",
  kafka:       "A0A0A0", // Apache Kafka official (#231F20) is near-black — use readable grey
};

export interface TechIconInfo {
  path: string;
  hex: string;   // brand colour without '#'
  title: string;
}

/**
 * Custom icons for tags not available in simple-icons.
 * Paths use a 24×24 viewBox (same as simple-icons).
 */
const CUSTOM_ICONS: Record<string, TechIconInfo> = {
  // Shedlock — padlock (Material Design lock icon)
  shedlock: {
    hex: "8B9EB7",
    title: "Shedlock",
    path: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z",
  },
  // Amazon Web Services
  aws: {
    hex: "FF9900",
    title: "Amazon Web Services",
    path: "M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.064.056.128.056.184 0 .08-.048.16-.152.24l-.504.336a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.232-.112a2.39 2.39 0 0 1-.28-.368 6.1 6.1 0 0 1-.24-.456c-.608.712-1.368 1.072-2.28 1.072-.648 0-1.168-.184-1.544-.552-.376-.368-.568-.864-.568-1.48 0-.656.232-1.184.704-1.576.472-.392 1.1-.592 1.896-.592.264 0 .536.024.816.064.28.04.568.104.864.176v-.552c0-.576-.12-.984-.352-1.216-.24-.232-.648-.344-1.224-.344-.264 0-.536.032-.816.104-.28.072-.552.16-.816.272-.12.056-.208.088-.264.104a.383.383 0 0 1-.112.016c-.096 0-.144-.072-.144-.224v-.352c0-.112.016-.2.056-.248a.571.571 0 0 1 .224-.168c.264-.136.584-.248.96-.336a4.74 4.74 0 0 1 1.224-.144c.936 0 1.616.208 2.056.632.432.424.656 1.072.656 1.944v2.56zm-3.152 1.16c.256 0 .52-.048.8-.144.28-.096.528-.272.736-.512.12-.144.208-.304.256-.488.048-.184.08-.408.08-.672v-.32a6.645 6.645 0 0 0-.704-.128 5.686 5.686 0 0 0-.72-.04c-.504 0-.872.096-1.12.296-.248.2-.368.48-.368.848 0 .344.088.6.272.768.176.176.432.264.768.264zm6.12.824c-.12 0-.2-.016-.256-.064-.056-.04-.104-.128-.144-.248l-1.608-5.304a1.187 1.187 0 0 1-.064-.264c0-.104.048-.16.152-.16h.632c.128 0 .216.016.264.064.056.04.096.128.136.248l1.152 4.536 1.064-4.536c.032-.128.072-.208.128-.248a.48.48 0 0 1 .272-.064h.52c.128 0 .216.016.272.064.056.04.104.128.128.248l1.08 4.6 1.192-4.6c.04-.128.088-.208.136-.248a.441.441 0 0 1 .264-.064h.6c.104 0 .16.056.16.16 0 .032-.008.064-.016.104-.008.04-.024.096-.048.176l-1.656 5.304c-.04.128-.08.208-.136.248-.056.048-.144.064-.264.064h-.56c-.128 0-.216-.016-.272-.064-.056-.04-.104-.12-.128-.256l-1.056-4.4-1.056 4.4c-.032.128-.072.208-.128.256-.056.04-.152.064-.272.064h-.56zm8.944.176c-.384 0-.768-.04-1.144-.128-.376-.088-.664-.184-.856-.296-.12-.064-.2-.136-.224-.2a.544.544 0 0 1-.04-.208v-.368c0-.152.056-.224.168-.224.04 0 .08.008.12.024.04.016.1.04.176.072.24.104.496.184.776.24.288.056.568.08.856.08.456 0 .808-.08 1.064-.24.256-.16.384-.384.384-.68 0-.2-.064-.368-.192-.512-.128-.136-.376-.264-.736-.384l-1.056-.336c-.536-.168-.928-.416-1.168-.744a1.8 1.8 0 0 1-.36-1.08c0-.312.072-.584.208-.824.136-.24.32-.448.552-.608.232-.168.496-.296.8-.384.304-.088.624-.128.96-.128.168 0 .344.008.512.032.176.024.336.056.496.096.152.04.296.088.432.144.136.056.24.112.312.168a.659.659 0 0 1 .184.184.432.432 0 0 1 .04.2v.336c0 .152-.056.232-.16.232-.056 0-.144-.032-.264-.096a3.174 3.174 0 0 0-1.352-.272c-.408 0-.72.064-.944.2-.224.136-.336.344-.336.624 0 .2.072.368.208.504.136.136.408.272.8.4l1.032.328c.528.168.912.4 1.144.712.232.312.344.672.344 1.072 0 .32-.064.608-.2.864a2.065 2.065 0 0 1-.56.656 2.52 2.52 0 0 1-.856.408 3.74 3.74 0 0 1-1.088.144zM21.4 17.296c-2.648 1.96-6.496 3-9.8 3-4.64 0-8.816-1.712-11.976-4.56-.248-.224-.024-.528.272-.352 3.408 1.984 7.616 3.168 11.968 3.168 2.936 0 6.16-.608 9.128-1.872.44-.192.816.288.408.616zM22.208 16.312c-.344-.44-2.272-.208-3.136-.104-.264.032-.304-.2-.064-.376 1.536-1.08 4.056-.768 4.352-.408.296.368-.08 2.888-1.52 4.096-.224.184-.432.088-.336-.16.32-.808 1.04-2.608.704-3.048z",
  },
  "amazon web services": { hex: "FF9900", title: "Amazon Web Services", path: "" }, // filled below
};
// alias shares the same object
CUSTOM_ICONS["amazon web services"] = CUSTOM_ICONS.aws;

export function getTechIcon(tagName: string): TechIconInfo | undefined {
  const key = tagName.toLowerCase();
  if (CUSTOM_ICONS[key]) return CUSTOM_ICONS[key];
  const icon: SimpleIcon | undefined = ICON_MAP[key];
  if (!icon) return undefined;
  return { path: icon.path, hex: HEX_OVERRIDES[key] ?? icon.hex, title: icon.title };
}
