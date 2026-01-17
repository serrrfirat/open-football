import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

interface Message {
  id: string;
  role: 'manager' | 'character';
  content: string;
  emotion?: string;
}

// Mock character data
const mockCharacter = {
  id: 'marco-rossi',
  name: 'Marco Rossi',
  role: 'player',
  position: 'ST',
  age: 26,
  mood: 35,
  trustInManager: 40,
  imageUrl: null,
};

// Mock conversation
const mockMessages: Message[] = [
  {
    id: '1',
    role: 'character',
    content: "Boss, I need to talk to you. I've been patient, but I can't keep sitting on the bench while the team struggles.",
    emotion: 'frustrated',
  },
];

export default function Conversation() {
  const { id } = useParams();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'manager',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'character',
        content: getMockResponse(input),
        emotion: 'thoughtful',
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 pb-4 border-b border-gray-700">
        <Link to="/inbox" className="text-gray-400 hover:text-white">
          ← Back
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-xl">
            😤
          </div>
          <div>
            <h2 className="font-semibold">{mockCharacter.name}</h2>
            <div className="text-sm text-gray-400">
              {mockCharacter.position} • {mockCharacter.age} years old
            </div>
          </div>
        </div>
        <div className="ml-auto flex gap-4 text-sm">
          <div>
            <span className="text-gray-400">Mood:</span>{' '}
            <span className={mockCharacter.mood < 50 ? 'text-red-400' : 'text-green-400'}>
              {mockCharacter.mood}%
            </span>
          </div>
          <div>
            <span className="text-gray-400">Trust:</span>{' '}
            <span className={mockCharacter.trustInManager < 50 ? 'text-red-400' : 'text-green-400'}>
              {mockCharacter.trustInManager}%
            </span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} characterName={mockCharacter.name} />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
              😤
            </div>
            <div className="bg-gray-800 rounded-lg px-4 py-2">
              <span className="animate-pulse">Typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-gray-700">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your response..."
            className="flex-1 bg-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            Send
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <QuickReply onClick={() => setInput("I understand your frustration, but you need to be patient.")}>
            Be patient
          </QuickReply>
          <QuickReply onClick={() => setInput("I promise you'll start the next match.")}>
            Promise playing time
          </QuickReply>
          <QuickReply onClick={() => setInput("Your recent performances haven't been good enough.")}>
            Criticize performance
          </QuickReply>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, characterName }: { message: Message; characterName: string }) {
  const isManager = message.role === 'manager';

  return (
    <div className={`flex items-start gap-3 ${isManager ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isManager ? 'bg-primary-600' : 'bg-gray-600'
      }`}>
        {isManager ? '👔' : '😤'}
      </div>
      <div className={`max-w-[70%] ${isManager ? 'text-right' : ''}`}>
        <div className="text-xs text-gray-400 mb-1">
          {isManager ? 'You' : characterName}
          {message.emotion && !isManager && (
            <span className="ml-2 text-gray-500">({message.emotion})</span>
          )}
        </div>
        <div className={`rounded-lg px-4 py-2 ${
          isManager ? 'bg-primary-600' : 'bg-gray-800'
        }`}>
          {message.content}
        </div>
      </div>
    </div>
  );
}

function QuickReply({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-sm text-gray-300 transition-colors"
    >
      {children}
    </button>
  );
}

function getMockResponse(input: string): string {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes('promise') || lowerInput.includes('start')) {
    return "You said that two weeks ago, boss. You promised I'd start against Napoli, and what happened? I watched from the bench again. How can I trust your promises anymore?";
  }

  if (lowerInput.includes('patient') || lowerInput.includes('wait')) {
    return "Patient? I've been patient for months! I scored 12 goals last season, and now I'm watching players with half my ability take my spot. I'm 26 - I don't have time to waste on the bench.";
  }

  if (lowerInput.includes('perform') || lowerInput.includes('training')) {
    return "*crosses arms* My performances? When was the last time you actually gave me a proper run of games? You can't judge someone on 15-minute cameos when we're already losing.";
  }

  return "I hear what you're saying, boss, but I need more than words. I need to know I have a future here, or maybe... maybe I need to look elsewhere.";
}
