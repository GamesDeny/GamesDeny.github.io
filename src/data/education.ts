import type { EducationEntry } from "@/types";

/**
 * Education data.
 * To migrate to a DB: replace this array with a fetch call in src/lib/data.ts.
 */
const education: EducationEntry[] = [
  {
    institution: "University of Example",
    degree: "B.S.",
    field: "Computer Science",
    startDate: "2017",
    endDate: "2021",
    gpa: "110/110",
    notes: ["Thesis on distributed systems fault tolerance"],
  },
];

export default education;
