import { redirect } from "next/navigation";

interface HomeProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string") {
      query.set(key, value);
      return;
    }

    value?.forEach((item) => {
      query.append(key, item);
    });
  });

  const destination = query.size > 0 ? `/login?${query.toString()}` : "/login";

  redirect(destination);
}
