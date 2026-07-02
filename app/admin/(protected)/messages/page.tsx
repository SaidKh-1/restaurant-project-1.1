import type { Metadata } from "next";

import { MessagesManagementManager } from "@/components/admin/messages-management-manager";

export const metadata: Metadata = {
  title: "رسائل التواصل",
};

export default function MessagesManagementPage() {
  return <MessagesManagementManager />;
}
