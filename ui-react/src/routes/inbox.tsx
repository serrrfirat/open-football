import { useState } from 'react';
import { Link } from 'react-router-dom';

interface InboxItem {
  id: string;
  icon: string;
  title: string;
  preview: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  gameDate: string;
  characterId: string;
  conversationType: string;
  read: boolean;
}

// Mock data
const mockInbox: InboxItem[] = [
  {
    id: '1',
    icon: '😤',
    title: 'Marco Rossi wants to talk',
    preview: 'Unhappy about playing time - dropped for last 3 matches',
    priority: 'urgent',
    gameDate: 'Today',
    characterId: 'marco-rossi',
    conversationType: 'player_unhappy',
    read: false,
  },
  {
    id: '2',
    icon: '🎤',
    title: 'Press Conference',
    preview: 'Pre-match press conference vs AC Milan',
    priority: 'high',
    gameDate: 'Today',
    characterId: 'press',
    conversationType: 'press_conference',
    read: false,
  },
  {
    id: '3',
    icon: '📝',
    title: 'Paulo Dybala - Contract Discussion',
    preview: 'Contract expires in 6 months, wants to discuss future',
    priority: 'medium',
    gameDate: 'Yesterday',
    characterId: 'paulo-dybala',
    conversationType: 'contract_negotiation',
    read: true,
  },
  {
    id: '4',
    icon: '🤝',
    title: 'Agent Call: Mino Raiola',
    preview: 'Wants to discuss transfer options for client',
    priority: 'low',
    gameDate: '2 days ago',
    characterId: 'agent-raiola',
    conversationType: 'agent_call',
    read: true,
  },
];

export default function Inbox() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [items] = useState<InboxItem[]>(mockInbox);

  const filteredItems = filter === 'unread' ? items.filter(i => !i.read) : items;
  const unreadCount = items.filter(i => !i.read).length;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inbox</h1>
          <p className="text-gray-400">{unreadCount} unread items</p>
        </div>
        <div className="flex gap-2">
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
            All
          </FilterButton>
          <FilterButton active={filter === 'unread'} onClick={() => setFilter('unread')}>
            Unread
          </FilterButton>
        </div>
      </header>

      <div className="space-y-3">
        {filteredItems.map((item) => (
          <InboxItemCard key={item.id} item={item} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No items to show
        </div>
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-primary-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {children}
    </button>
  );
}

function InboxItemCard({ item }: { item: InboxItem }) {
  const priorityColors = {
    urgent: 'border-red-500 bg-red-500/10',
    high: 'border-orange-500',
    medium: 'border-yellow-500',
    low: 'border-gray-500',
  };

  return (
    <Link
      to={`/conversation/${item.id}`}
      className={`block p-4 bg-gray-800 rounded-lg border-l-4 hover:bg-gray-750 transition-colors ${
        priorityColors[item.priority]
      } ${!item.read ? 'ring-1 ring-primary-500/30' : ''}`}
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl">{item.icon}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${!item.read ? 'text-white' : 'text-gray-300'}`}>
              {item.title}
            </h3>
            <span className="text-sm text-gray-400">{item.gameDate}</span>
          </div>
          <p className="text-gray-400 mt-1">{item.preview}</p>
          <div className="mt-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              item.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
              item.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
              item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {item.priority}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
