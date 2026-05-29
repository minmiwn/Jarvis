import { useVoiceAssistant, useLocalParticipant } from '@livekit/components-react';


export default function BottomBar({ onDisconnect }) {
    const { localParticipant } = useLocalParticipant();
    const { state } = useVoiceAssistant();

    const isMicEnabled = localParticipant?.isMicrophoneEnabled ?? false;

    const toggleMic = async () => {
        if (localParticipant) {
            await localParticipant.setMicrophoneEnabled(!isMicEnabled);
        }
    };

    return (
        <div className="flex items-center gap-4 bg-[#1a0b2e]/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-purple-800">
            {/* Mic toggle */}
            <button
                onClick={toggleMic}
                title={isMicEnabled ? 'Tắt mic' : 'Bật mic'}
                className={`p-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-110 active:scale-95
                    ${isMicEnabled
                        ? 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                        : 'bg-gray-700 hover:bg-gray-600 opacity-60'
                    }`}
            >
                {isMicEnabled ? '🎤' : '🔇'}
            </button>

            {/* End Call */}
            <button
                onClick={onDisconnect}
                title="Kết thúc cuộc gọi"
                className="p-3 w-16 bg-pink-600 hover:bg-pink-500 rounded-xl shadow-[0_0_15px_rgba(219,39,119,0.5)] flex justify-center transition-all hover:scale-110 active:scale-95"
            >
                📞
            </button>

            {/* Agent state indicator */}
            <div className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all
                ${state === 'speaking' ? 'bg-green-900/50 border-green-600 text-green-300' :
                  state === 'listening' ? 'bg-blue-900/50 border-blue-600 text-blue-300' :
                  state === 'thinking' ? 'bg-yellow-900/50 border-yellow-600 text-yellow-300' :
                  'bg-gray-800/50 border-gray-600 text-gray-400'}`}
            >
                {state === 'speaking' ? '🔊 Speaking' :
                 state === 'listening' ? '👂 Listening' :
                 state === 'thinking' ? '🧠 Thinking' : '💤 Idle'}
            </div>
        </div>
    );
}