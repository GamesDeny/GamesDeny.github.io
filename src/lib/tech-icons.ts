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

export interface TechIconInfo {
  path: string;
  hex: string;   // brand colour without '#'
  title: string;
}

export function getTechIcon(tagName: string): TechIconInfo | undefined {
  const icon: SimpleIcon | undefined = ICON_MAP[tagName.toLowerCase()];
  if (!icon) return undefined;
  return { path: icon.path, hex: icon.hex, title: icon.title };
}
