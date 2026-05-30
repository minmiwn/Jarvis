import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import '@livekit/components-styles';
import { useLiveKitToken } from './hooks/useLiveKitToken';
import Visualizer from './components/chat/Visualizer';
import MessageList from './components/chat/MessageList';
import MessageInput from './components/chat/MessageInput';
import BottomBar from './components/controls/BottomBar';
import './App.css';

import backgroundImg from './assets/background.jpg';
import chibiImg from './assets/chibi.png';

/* Falling petals decoration */
function FallingPetals() {
  const petals = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${6 + Math.random() * 6}s`,
    size: `${8 + Math.random() * 10}px`,
  }));

  return (
    <>
      {petals.map((p) => (
        <div
          key={p.id}
          className="petal"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: p.size,
          }}
        />
      ))}
    </>
  );
}

function App() {
  const { token, url, loading, error, fetchToken, disconnect } = useLiveKitToken();

  const handleConnect = () => {
    fetchToken('jarvis-room', 'Minh');
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const getStatusText = () => {
    if (token) return 'Connected';
    if (loading) return 'Connecting';
    if (error) return 'Disconnected';
    return 'Offline';
  };

  const getStatusClass = () => {
    if (token) return 'connected';
    if (error) return 'error';
    return '';
  };

  return (
    <div className="font-comfortaa" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Background */}
      <div className="jarvis-bg" style={{ backgroundImage: `url(${backgroundImg})` }} />

      {/* Falling petals */}
      <FallingPetals />

      {/* Main content */}
      <div className="jarvis-container">
        <div className={`main-panel${token ? ' panel-connected' : ''}`}>

          {/* Robot avatar */}
          <div className="robot-frame">
            <img src={chibiImg} alt="Jarvis Robot" className="robot-gif" />
          </div>

          {token ? (
            /* Connected: LiveKit room */
            <LiveKitRoom
              token={token}
              serverUrl={url}
              audio={true}
              video={false}
              onDisconnected={handleDisconnect}
              style={{ display: 'contents' }}
            >
              {/* Visualizer (agent state) */}
              <Visualizer />

              {/* Transcript / Chat */}
              <MessageList />

              {/* Text input */}
              <MessageInput />

              {/* Controls */}
              <BottomBar onDisconnect={handleDisconnect} />

              {/* Audio renderer */}
              <RoomAudioRenderer />
            </LiveKitRoom>
          ) : (
            /* Not connected: welcome */
            <div className="welcome-area">
              {error && (
                <p className="error-msg">⚠️ {error}</p>
              )}

              <button
                onClick={handleConnect}
                disabled={loading}
                className="connect-btn"
              >
                {loading ? '⏳ Connecting...' : '🌸 Connect to Jarvis'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;