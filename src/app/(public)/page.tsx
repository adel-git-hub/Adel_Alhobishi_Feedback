// This route group page is intentionally left to redirect to root.
// The actual public portal UI lives in src/app/page.tsx
import { redirect } from "next/navigation";

export default function PublicGroupPage() {
  redirect("/");
}
