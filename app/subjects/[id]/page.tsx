import { officialSubjects } from "@/lib/officialData";
import { createSeedData } from "@/lib/seedData";
import SubjectDetailClient from "./SubjectDetailClient";

export function generateStaticParams() {
  const ids = new Set([
    ...createSeedData().subjects.map((subject) => subject.id),
    ...officialSubjects.map((subject) => subject.id)
  ]);

  return Array.from(ids).map((id) => ({ id }));
}

export default function SubjectDetailPage({ params }: { params: { id: string } }) {
  return <SubjectDetailClient subjectId={params.id} />;
}
