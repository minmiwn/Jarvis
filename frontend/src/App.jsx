import { LiveKitRoom, RoomAudioRenderer, useLocalParticipant, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';
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

/* Local Camera Preview Component */
function LocalCameraPreview() {
  const { localParticipant } = useLocalParticipant();
  const isCameraEnabled = localParticipant?.isCameraEnabled ?? false;

  if (!isCameraEnabled) return null;

  const cameraPub = localParticipant?.getTrackPublication(Track.Source.Camera);
  const trackRef = cameraPub ? {
    participant: localParticipant,
    source: Track.Source.Camera,
    publication: cameraPub,
  } : null;

  return (
    <div className="camera-frame">
      {trackRef && <VideoTrack trackRef={trackRef} className="camera-video" />}
      <div className="camera-label">Bạn</div>
    </div>
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

          {token ? (
            /* Connected: LiveKit room */
            <LiveKitRoom
              token={token}
              serverUrl={url}
              audio={true}
              video={true}
              onDisconnected={handleDisconnect}
              style={{ display: 'contents' }}
            >
              {/* Avatars container (Robot + User Camera) */}
              <div className="avatars-container">
                <div className="robot-frame">
                  <img src={chibiImg} alt="Jarvis Robot" className="robot-gif" />
                </div>
                <LocalCameraPreview />
              </div>

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
            <>
              {/* Robot avatar */}
              <div className="robot-frame">
                <img src={chibiImg} alt="Jarvis Robot" className="robot-gif" />
              </div>

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
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;