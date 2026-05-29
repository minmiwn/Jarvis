import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import '@livekit/components-styles';
import { useLiveKitToken } from './hooks/useLiveKitToken';
import Sidebar from './components/layout/Sidebar';
import ChatHeader from './components/chat/ChatHeader';
import Visualizer from './components/chat/Visualizer';
import MessageList from './components/chat/MessageList';
import MessageInput from './components/chat/MessageInput';
import BottomBar from './components/controls/BottomBar';

function App() {
  const { token, url, loading, error, fetchToken, disconnect } = useLiveKitToken();

  const handleConnect = () => {
    fetchToken('jarvis-room', 'Minh');
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div className="flex h-screen w-full bg-[#110524] text-white p-4 font-pixel">
      <div className="flex w-full h-full border border-purple-800 rounded-xl overflow-hidden bg-[#16082a]">

        {/* 1. Sidebar */}
        <div className="w-1/4 border-r border-purple-800 flex flex-col">
          <Sidebar connected={!!token} onDisconnect={handleDisconnect} />
        </div>

        {/* 2. Chat area */}
        <div className="w-3/4 flex flex-col relative">
          <ChatHeader connected={!!token} loading={loading} error={error} />

          {token ? (
            /* Khi đã có token → bọc trong LiveKitRoom để bật WebRTC */
            <LiveKitRoom
              token={token}
              serverUrl={url}
              audio={true}
              video={false}
              onDisconnected={handleDisconnect}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                <Visualizer />
                <MessageList />
              </div>

              <MessageInput />

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <BottomBar onDisconnect={handleDisconnect} />
              </div>

              {/* Phát audio từ agent (remote participant) */}
              <RoomAudioRenderer />
            </LiveKitRoom>
          ) : (
            /* Khi chưa connect → hiện màn hình welcome */
            <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
              <div className="w-32 h-32 bg-purple-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(147,51,234,0.6)] animate-pulse">
                <span className="text-5xl">🤖</span>
              </div>
              <p className="text-gray-400 text-sm">Jarvis đang chờ kết nối...</p>

              {error && (
                <p className="text-red-400 text-xs bg-red-900/30 px-4 py-2 rounded-lg border border-red-700">
                  ⚠️ {error}
                </p>
              )}

              <button
                onClick={handleConnect}
                disabled={loading}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all hover:shadow-[0_0_30px_rgba(147,51,234,0.7)] hover:scale-105 active:scale-95"
              >
                {loading ? '⏳ Đang kết nối...' : '🚀 Connect to Jarvis'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;