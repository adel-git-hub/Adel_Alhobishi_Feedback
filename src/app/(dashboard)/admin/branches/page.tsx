import { getBranches } from "@/app/actions/admin.actions";
import BranchesClient from "./BranchesClient";

export default async function BranchesPage() {
  const branches = await getBranches();
  return <BranchesClient initialBranches={branches} />;
}
