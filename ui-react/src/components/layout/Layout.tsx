import { Outlet, Link } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white">AI Football Manager</h1>
          <p className="text-sm text-gray-400">Juventus FC</p>
        </div>

        <nav className="space-y-2">
          <NavLink to="/" icon="🏠">Dashboard</NavLink>
          <NavLink to="/inbox" icon="📬">Inbox</NavLink>
          <NavLink to="/squad" icon="👥">Squad</NavLink>
          <NavLink to="/matches" icon="⚽">Matches</NavLink>
          <NavLink to="/tactics" icon="📋">Tactics</NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, icon, children }: { to: string; icon: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
    >
      <span>{icon}</span>
      <span>{children}</span>
    </Link>
  );
}
