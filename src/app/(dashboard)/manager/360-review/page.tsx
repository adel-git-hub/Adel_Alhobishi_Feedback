import { getBranchEmployees, getInternalCriteria } from "@/app/actions/manager.actions";
import Review360Client from "./Review360Client";

export default async function Review360Page() {
  const [employees, criteria] = await Promise.all([
    getBranchEmployees(),
    getInternalCriteria()
  ]);

  return <Review360Client employees={employees} criteria={criteria} />;
}
