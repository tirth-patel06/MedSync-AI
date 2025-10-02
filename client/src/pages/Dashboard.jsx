import React from "react";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  if ("Notification" in window) {
  Notification.requestPermission().then((perm) => {
    if (perm === "granted") {
      console.log("✅ Notifications enabled");
    }
  });
}


  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user?.name || "Alchemist"}</h1>
      <p className="mb-6">This is your magical Grimoire dashboard.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded shadow">
          <h2 className="font-bold mb-2">Upcoming Elixirs</h2>
          <p>No doses scheduled yet.</p>
        </div>
        <div className="bg-gray-800 p-4 rounded shadow">
          <h2 className="font-bold mb-2">Missed Doses</h2>
          <p>0</p>
        </div>
        <div className="bg-gray-800 p-4 rounded shadow">
          <h2 className="font-bold mb-2">Wellness Rate</h2>
          <p>100%</p>
        </div>
      </div>
    </div>
  );
}