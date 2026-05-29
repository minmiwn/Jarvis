export default function Sidebar() {
  return (
    <div className="flex flex-col h-full justify-between p-4">
      {/* Top: Logo & Menu */}
      <div>
        <h1 className="text-2xl font-bold text-purple-300 mb-8 flex items-center gap-2">
          🤖 JARVIS
        </h1>
        <nav className="flex flex-col gap-2">
          <button className="bg-purple-900 text-left px-4 py-2 rounded-lg text-purple-200">💬 Chat</button>
          <button className="text-left px-4 py-2 hover:bg-purple-900/50 rounded-lg text-gray-400">🧠 Memory</button>
          <button className="text-left px-4 py-2 hover:bg-purple-900/50 rounded-lg text-gray-400">🛠️ Tools</button>
          <button className="text-left px-4 py-2 hover:bg-purple-900/50 rounded-lg text-gray-400">⚙️ Settings</button>
        </nav>

        {/* Rooms */}
        <div className="mt-8">
          <h2 className="text-xs text-gray-500 mb-2 uppercase">Rooms</h2>
          <ul className="flex flex-col gap-2">
            <li className="flex justify-between text-sm text-purple-200"><span>General</span> <span>2</span></li>
            <li className="flex justify-between text-sm text-gray-400"><span>Work</span> <span>🔒</span></li>
            <li className="flex justify-between text-sm text-gray-400"><span>Study</span> <span>🔒</span></li>
          </ul>
        </div>
      </div>

      {/* Bottom: Profile */}
      <div className="flex items-center gap-3 border-t border-purple-800 pt-4 mt-4">
        <div className="w-10 h-10 bg-blue-900 rounded-md"></div> {/* Avatar Placeholder */}
        <div>
          <p className="text-sm font-bold">You</p>
          <p className="text-xs text-green-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
          </p>
        </div>
      </div>
    </div>
  );
}