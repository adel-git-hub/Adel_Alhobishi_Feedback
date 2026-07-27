import { getPublicBranches } from "@/app/actions/public.actions";
import PublicHomeClient from "@/app/(public)/PublicHomeClient";

export default async function MerchantPage() {
  const branches = await getPublicBranches();
  return <PublicHomeClient initialBranches={branches} accessType="MERCHANT_CUSTOMER" />;
}
