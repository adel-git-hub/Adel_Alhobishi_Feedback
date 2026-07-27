import { getCriteria } from "@/app/actions/admin.actions";
import CriteriaClient from "./CriteriaClient";

export default async function CriteriaPage() {
  const criteria = await getCriteria();
  return <CriteriaClient initialCriteria={criteria as any} />;
}
