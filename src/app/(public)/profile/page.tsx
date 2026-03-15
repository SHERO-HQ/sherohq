import type { Metadata } from "next";
import Profile from "@/views/auth/Profile";

export const metadata: Metadata = {
 title: "My Profile",
};

export default function ProfilePage() {
 return <Profile />;
}
