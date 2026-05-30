import { useVoiceAssistant, useLocalParticipant } from '@livekit/components-react';

export default function BottomBar({ onDisconnect }) {
    const { localParticipant } = useLocalParticipant();
    const { state } = useVoiceAssistant();

    const isMicEnabled = localParticipant?.isMicrophoneEnabled ?? false;
    const isCameraEnabled = localParticipant?.isCameraEnabled ?? false;

    const toggleMic = async () => {
        if (localParticipant) {
            await localParticipant.setMicrophoneEnabled(!isMicEnabled);
        }
    };

    const toggleCamera = async () => {
        if (localParticipant) {
            await localParticipant.setCameraEnabled(!isCameraEnabled);
        }
    };

    return (
        <div className="controls-bar">
            {/* Mic toggle */}
            <button
                onClick={toggleMic}
                title={isMicEnabled ? 'Tắt mic' : 'Bật mic'}
                className={`ctrl-btn ${isMicEnabled ? 'mic-on' : 'mic-off'}`}
            >
                {isMicEnabled ? '🎤' : '🔇'}
            </button>

            {/* Camera toggle */}
            <button
                onClick={toggleCamera}
                title={isCameraEnabled ? 'Tắt camera' : 'Bật camera'}
                className={`ctrl-btn ${isCameraEnabled ? 'cam-on' : 'cam-off'}`}
            >
                {isCameraEnabled ? '📹' : '📵'}
            </button>

            {/* End Call */}
            <button
                onClick={onDisconnect}
                title="Kết thúc cuộc gọi"
                className="ctrl-btn end-call"
            >
                📞
            </button>

            {/* Agent state mini indicator */}
            <span className="status-badge" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>
                {state === 'speaking' ? '🔊' :
                 state === 'listening' ? '👂' :
                 state === 'thinking' ? '🧠' : '💤'}
            </span>
        </div>
    );
}