import { getAllPublicDoctors, getPublicDoctorProfile } from "@/api";

export async function generateStaticParams() {
  const limit = 100;
  const first = await getAllPublicDoctors({ page: 1, limit });

  const totalPages = first.meta.totalPages ?? 1;

  const all = [...first.data];

  for (let page = 2; page <= totalPages; page++) {
    const data = await getAllPublicDoctors({ page, limit });
    all.push(...data.data);
  }

  return all.map((doctor) => ({ id: doctor.id }));
}

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = (await getPublicDoctorProfile(id)) || undefined;
  const doctor = data.data || undefined;
  if (!data) {
    return <p>No doctor found with this id</p>;
  }
  return (
    <div>
      <p>Name: {doctor.name}</p>
    </div>
  );
}
