import type { EducationEntry } from "@/types";

const education: EducationEntry[] = [
  {
    institution: "University of Example",
    degree: { en: "B.S.", it: "Laurea Triennale" },
    field: { en: "Computer Science", it: "Informatica" },
    startDate: "2017",
    endDate: "2021",
    gpa: "110/110",
    notes: {
      en: ["Thesis on distributed systems fault tolerance"],
      it: ["Tesi sulla tolleranza ai guasti nei sistemi distribuiti"],
    },
  },
];

export default education;
