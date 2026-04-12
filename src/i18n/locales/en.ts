export interface Translations {
  easterEggs: {
    doom: {
      header: string;
      mode: string;
      health: string;
      armor: string;
      ammo: string;
      continue: string;
    };
    forkBomb: {
      panic: string;
      detail: string;
      reboot: string;
      joke: string;
      continue: string;
    };
    cooking: {
      breakfast: string;
      lunch: string;
      dinner: string;
      ready: string;
      continue: string;
    };
  };
  nav: {
    about: string;
    projects: string;
    experience: string;
    languages: string;
    technologies: string;
    contact: string;
  };
  hero: {
    greeting: string;
    tagline: string;
    bio: string;
    cta_projects: string;
    cta_resume: string;
  };
  projects: {
    title: string;
    subtitle: string;
    github: string;
    live: string;
    featured: string;
  };
  experience: {
    title: string;
    subtitle: string;
    present: string;
    work: string;
    education: string;
  };
  languages: {
    title: string;
    subtitle: string;
    expert: string;
    proficient: string;
    familiar: string;
    learning: string;
  };
  technologies: {
    title: string;
    subtitle: string;
  };
  contact: {
    title: string;
    subtitle: string;
    copy_email: string;
    copied: string;
    find_me: string;
  };
}

const en: Translations = {
  easterEggs: {
    doom: {
      header: "══ DOOM ══ cheat code detected ══",
      mode: "DEGREELESSNESS MODE ON",
      health: "Health",
      armor: "Armor",
      ammo: "Ammo",
      continue: "press any key to continue_",
    },
    forkBomb: {
      panic: "KERNEL PANIC — not syncing: fork bomb detected",
      detail: "too many processes — system resources exhausted",
      reboot: "[    0.000000] Rebooting in 3 seconds...",
      joke: "just kidding :)",
      continue: "press any key to continue_",
    },
    cooking: {
      breakfast: "Breakfast",
      lunch: "Lunch",
      dinner: "Dinner",
      ready: "{meal}-ms is ready to be served",
      continue: "press any key to continue_",
    },
  },
  nav: {
    about: "about",
    projects: "projects",
    experience: "experience",
    languages: "languages",
    technologies: "technologies",
    contact: "contact",
  },
  hero: {
    greeting: "> Hi, I'm",
    tagline: "Software Engineer",
    bio: "I build reliable, scalable software and enjoy solving hard problems. Passionate about clean architecture, developer tooling, and turning complex ideas into working systems.",
    cta_projects: "view projects",
    cta_resume: "download resume",
  },
  projects: {
    title: "projects",
    subtitle: "Things I've built",
    github: "source",
    live: "live",
    featured: "featured",
  },
  experience: {
    title: "experience",
    subtitle: "Where I've worked",
    present: "Present",
    work: "Work",
    education: "Education",
  },
  languages: {
    title: "languages",
    subtitle: "Technologies I work with",
    expert: "Expert",
    proficient: "Proficient",
    familiar: "Familiar",
    learning: "Learning",
  },
  technologies: {
    title: "technologies",
    subtitle: "Skills from my work experience",
  },
  contact: {
    title: "contact",
    subtitle: "Get in touch",
    copy_email: "copy email",
    copied: "copied!",
    find_me: "Find me on",
  },
};

export default en;
