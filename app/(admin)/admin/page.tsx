// app/(admin)/admin/page.tsx
import React from "react";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to the FortiTwin control center.
      </p>
      {/* We will add stats and management cards here in the next steps */}
    </div>
  );
}