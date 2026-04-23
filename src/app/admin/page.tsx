import { redirect } from "next/navigation";

// /admin → /dashboard redirect (keeps URL clean on admin.sherohq.com)
export default function AdminIndexPage() {
 redirect("/dashboard");
}
