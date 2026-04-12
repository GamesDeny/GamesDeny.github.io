# Personal Portfolio

Dark/hacker-aesthetic personal portfolio built with Next.js 16, Tailwind CSS v4, and TypeScript.

## Stack

- **Framework**: Next.js 16.2.3 (App Router, React 19)
- **Styling**: Tailwind CSS v4, JetBrains Mono, neon-green accent (`#00ff9f`)
- **Icons**: `lucide-react`, `simple-icons` (brand logos in Technologies section)
- **i18n**: Custom — locale files in `src/i18n/locales/`, `useI18n()` hook, `localized()` helper
- **Content**: JSON files in `content/` (override seed data in `src/data/`)
- **Auth**: Cookie-based (`admin_session` = `ADMIN_PASSWORD` env var), Next.js middleware

## Project Structure

```
src/
  app/
    page.tsx                  # Public single-page site
    admin/                    # Admin panel (protected by middleware)
      dashboard/
      projects/
      experience/
      languages/
      skills/
      i18n/
    api/admin/                # REST API routes (auth, projects, experience, languages, skills, i18n, education)
  components/
    layout/   Navbar, Footer
    sections/ Hero, Projects, Experience, Technologies, Contact
    ui/       ProjectCard, SkillBar, Badge, SectionTitle, ...
    admin/    AdminSidebar, BulkActionBar, ConfirmModal, SaveToast, ...
  lib/
    data.ts           getProjects(), getExperience(), getLanguages(), getSkills(), getEducation()
    i18n-utils.ts     localized(), localizedArray()
    tech-icons.ts     getTechIcon() — simple-icons lookup by tag name
    admin/auth.ts     verifySession()
  types/index.ts      Project, WorkEntry, EducationEntry, Language, Skill, LocalizedString, LocalizedStringArray
  i18n/               useI18n hook, availableLocales, locale files (en, it)
  config/             siteConfig, contact (social links from env vars)
content/
  projects.json / experience.json / education.json / languages.json / skills.json
```

## Multilingual Content

Translatable fields use `LocalizedString = Record<string, string>` and `LocalizedStringArray = Record<string, string[]>`.

Public components call `localized(val, locale)` / `localizedArray(val, locale)` with EN fallback.
Admin forms show one input per locale (labeled `[en]`, `[it]`, …).

## Admin Panel

| Route | Purpose |
|---|---|
| `/admin/login` | Cookie auth |
| `/admin/dashboard` | Overview |
| `/admin/projects` | CRUD, tag picker, per-locale name/description |
| `/admin/experience` | Work + Education CRUD, tag picker, per-locale fields |
| `/admin/languages` | Programming language tags with proficiency |
| `/admin/skills` | Non-language tech tags (Docker, Kubernetes, …) |
| `/admin/i18n` | Translation table — one column per locale, paste JSON, missing-only filter |

Languages + Skills form the shared tag pool used in Projects tech stack and Experience skills.

## Environment Variables

```env
ADMIN_PASSWORD=...
NEXT_PUBLIC_LEETCODE=https://leetcode.com/u/...
NEXT_PUBLIC_ROADMAP_USERNAME=...   # optional
```

## Dev

```bash
npm run dev    # http://localhost:3000
npm run build  # production build
```
