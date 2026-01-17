interface Player {
  id: string;
  name: string;
  position: string;
  age: number;
  overall: number;
  mood: number;
  form: number;
  contractEnds: string;
}

const mockSquad: Player[] = [
  { id: '1', name: 'Wojciech Szczesny', position: 'GK', age: 33, overall: 83, mood: 75, form: 72, contractEnds: '2025' },
  { id: '2', name: 'Gleison Bremer', position: 'CB', age: 26, overall: 84, mood: 80, form: 85, contractEnds: '2028' },
  { id: '3', name: 'Federico Gatti', position: 'CB', age: 25, overall: 78, mood: 70, form: 68, contractEnds: '2028' },
  { id: '4', name: 'Andrea Cambiaso', position: 'LB', age: 23, overall: 80, mood: 85, form: 82, contractEnds: '2027' },
  { id: '5', name: 'Manuel Locatelli', position: 'CM', age: 26, overall: 82, mood: 65, form: 70, contractEnds: '2028' },
  { id: '6', name: 'Weston McKennie', position: 'CM', age: 25, overall: 79, mood: 60, form: 65, contractEnds: '2025' },
  { id: '7', name: 'Federico Chiesa', position: 'RW', age: 26, overall: 84, mood: 55, form: 60, contractEnds: '2025' },
  { id: '8', name: 'Dusan Vlahovic', position: 'ST', age: 24, overall: 86, mood: 70, form: 75, contractEnds: '2026' },
  { id: '9', name: 'Marco Rossi', position: 'ST', age: 26, overall: 82, mood: 35, form: 78, contractEnds: '2025' },
];

export default function Squad() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Squad</h1>
        <p className="text-gray-400">Juventus FC - 25 players</p>
      </header>

      {/* Squad overview stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Average Age" value="25.4" />
        <StatCard label="Team Morale" value="68%" warning />
        <StatCard label="Avg Rating" value="7.2" />
        <StatCard label="Contracts Expiring" value="4" warning />
      </div>

      {/* Players table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700 text-left">
              <th className="px-4 py-3 font-medium">Player</th>
              <th className="px-4 py-3 font-medium">Position</th>
              <th className="px-4 py-3 font-medium">Age</th>
              <th className="px-4 py-3 font-medium">Overall</th>
              <th className="px-4 py-3 font-medium">Mood</th>
              <th className="px-4 py-3 font-medium">Form</th>
              <th className="px-4 py-3 font-medium">Contract</th>
            </tr>
          </thead>
          <tbody>
            {mockSquad.map((player) => (
              <PlayerRow key={player.id} player={player} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, warning }: { label: string; value: string; warning?: boolean }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="text-gray-400 text-sm">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${warning ? 'text-yellow-400' : ''}`}>
        {value}
      </div>
    </div>
  );
}

function PlayerRow({ player }: { player: Player }) {
  const getMoodColor = (mood: number) => {
    if (mood >= 70) return 'text-green-400';
    if (mood >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getFormColor = (form: number) => {
    if (form >= 75) return 'bg-green-500';
    if (form >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const isContractExpiring = parseInt(player.contractEnds) <= 2025;

  return (
    <tr className="border-t border-gray-700 hover:bg-gray-750 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm">
            {player.name.split(' ').map(n => n[0]).join('')}
          </div>
          <span className="font-medium">{player.name}</span>
          {player.mood < 50 && <span title="Unhappy">😤</span>}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="px-2 py-1 bg-gray-700 rounded text-sm">{player.position}</span>
      </td>
      <td className="px-4 py-3">{player.age}</td>
      <td className="px-4 py-3 font-semibold">{player.overall}</td>
      <td className="px-4 py-3">
        <span className={getMoodColor(player.mood)}>{player.mood}%</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${getFormColor(player.form)}`}
              style={{ width: `${player.form}%` }}
            />
          </div>
          <span className="text-sm text-gray-400">{player.form}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={isContractExpiring ? 'text-red-400' : ''}>
          {player.contractEnds}
        </span>
      </td>
    </tr>
  );
}
