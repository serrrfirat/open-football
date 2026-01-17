import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Welcome, Manager</h1>
        <p className="text-gray-400">Season 2024/25 - Week 8</p>
      </header>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="League Position" value="3rd" />
        <StatCard label="Recent Form" value="WWLDW" />
        <StatCard label="Team Morale" value="68%" />
        <StatCard label="Board Confidence" value="72%" />
      </div>

      {/* Upcoming match */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Next Match</h2>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-2xl font-bold">Juventus</div>
            <div className="text-gray-400">Home</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">vs</div>
            <div className="text-sm text-gray-500">Sunday, 3:00 PM</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">AC Milan</div>
            <div className="text-gray-400">Away</div>
          </div>
        </div>
      </div>

      {/* Pending items */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Pending Items</h2>
          <Link to="/inbox" className="text-primary-500 hover:text-primary-400">
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          <InboxPreviewItem
            icon="😤"
            title="Marco Rossi wants to talk"
            preview="Unhappy about playing time"
            priority="high"
          />
          <InboxPreviewItem
            icon="🎤"
            title="Press Conference"
            preview="Pre-match vs AC Milan"
            priority="medium"
          />
          <InboxPreviewItem
            icon="📝"
            title="Contract expiring"
            preview="Paulo Dybala - 6 months remaining"
            priority="low"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="text-gray-400 text-sm">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function InboxPreviewItem({
  icon,
  title,
  preview,
  priority,
}: {
  icon: string;
  title: string;
  preview: string;
  priority: 'high' | 'medium' | 'low';
}) {
  const priorityColors = {
    high: 'border-red-500',
    medium: 'border-yellow-500',
    low: 'border-gray-500',
  };

  return (
    <div className={`flex items-center gap-4 p-3 bg-gray-700 rounded-lg border-l-4 ${priorityColors[priority]}`}>
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-gray-400">{preview}</div>
      </div>
    </div>
  );
}
