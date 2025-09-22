import UserMenu from './UserMenu';
const userTokens = 150; 
export default function Header() {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/dashboard" className="text-2xl font-bold text-purple-400">Fagulha.ia</a>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-900 px-3 py-1.5 rounded-full">
              <span className="text-yellow-400">⚡</span>
              <span className="font-semibold text-white">{userTokens}</span>
              <span className="text-gray-400 text-sm">tokens</span>
            </div>
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
