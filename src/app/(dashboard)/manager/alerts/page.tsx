import { getManagerAlerts } from "@/app/actions/manager.actions";
import AlertsClient from "./AlertsClient";

export default async function AlertsPage() {
  const rawAlerts = await getManagerAlerts();

  const alerts = rawAlerts.map(alert => ({
    id: alert.id,
    employeeName: alert.employee.name,
    score: alert.score,
    feedback: alert.feedback,
    status: alert.status as "NEW" | "RESOLVED",
    time: new Date(alert.createdAt).toLocaleString("ar-SA")
  }));

  return <AlertsClient initialAlerts={alerts} />;
}
