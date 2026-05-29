export default function ChatHeader({ connected, loading, error }) {
    const getStatusBadge = () => {
        if (connected) {
            return <span className="text-xs bg-green-900/50 border border-green-600 text-green-300 px-2 py-0.5 rounded-full">🟢 Connected</span>;
        }
        if (loading) {
            return <span className="text-xs bg-yellow-900/50 border border-yellow-600 text-yellow-300 px-2 py-0.5 rounded-full animate-pulse">🟡 Connecting...</span>;
        }
        if (error) {
            return <span className="text-xs bg-red-900/50 border border-red-700 text-red-300 px-2 py-0.5 rounded-full">🔴 Error</span>;
        }
        return <span className="text-xs bg-gray-800 border border-gray-600 text-gray-400 px-2 py-0.5 rounded-full">⚫ Offline</span>;
    };

    return (
        <div className="flex justify-between items-center p-6 border-b border-purple-800">
            <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">Chat</h2>
                {getStatusBadge()}
            </div>
            <div className="flex gap-4 text-gray-400">
                <button className="hover:text-purple-300 transition-colors" title="Video">📹</button>
                <button className="hover:text-purple-300 transition-colors" title="Transcript">📄</button>
                <button className="hover:text-purple-300 transition-colors" title="Fullscreen">⛶</button>
            </div>
        </div>
    );
}