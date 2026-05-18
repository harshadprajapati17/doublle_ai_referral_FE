import { redirect } from "next/navigation";

/** Legacy route — workspace billing moved to /billing. */
export default function DashboardPage() {
  redirect("/billing");
}
