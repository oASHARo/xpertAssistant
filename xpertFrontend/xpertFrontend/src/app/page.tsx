import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

// TODO(auth): once login exists, this should redirect to /login when
// unauthenticated and /jobs when authenticated, instead of always /jobs.
export default function RootPage() {
  redirect(ROUTES.login);
}
