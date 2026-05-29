import { useVoiceAssistant, BarVisualizer } from '@livekit/components-react';

const STATE_LABELS = {
    connecting: '🔄 Đang kết nối...',
    initializing: '⚙️ Khởi động...',
    listening: '🎙️ Đang nghe...',
    thinking: '🧠 Đang suy nghĩ...',
    speaking: '🔊 Đang nói...',
    idle: '💤 Chờ...',
};

export default function Visualizer() {
    const { state, audioTrack } = useVoiceAssistant();

    const isSpeaking = state === 'speaking';

    return (
        <div className="flex flex-col items-center justify-center py-8">
            <div className="flex items-center gap-4">
                {/* Sóng âm trái */}
                <div className="w-16 h-12 opacity-70">
                    {audioTrack && (
                        <BarVisualizer
                            trackRef={audioTrack}
                            barCount={5}
                            style={{ width: '100%', height: '100%' }}
                            options={{ minHeight: 4 }}
                        />
                    )}
                    {!audioTrack && (
                        <div className="flex items-center gap-1 h-full justify-center">
                            {[2, 4, 2, 4, 2].map((h, i) => (
                                <div key={i} className="w-1 bg-purple-600 opacity-40 rounded-full" style={{ height: `${h * 4}px` }} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Robot avatar */}
                <div
                    className={`w-32 h-32 bg-purple-600 rounded-3xl flex items-center justify-center transition-all duration-300
                        ${isSpeaking
                            ? 'shadow-[0_0_50px_rgba(147,51,234,0.9)] scale-105'
                            : 'shadow-[0_0_30px_rgba(147,51,234,0.5)]'
                        }`}
                >
                    <span className="text-4xl">🤖</span>
                </div>

                {/* Sóng âm phải */}
                <div className="w-16 h-12 opacity-70 scale-x-[-1]">
                    {audioTrack && (
                        <BarVisualizer
                            trackRef={audioTrack}
                            barCount={5}
                            style={{ width: '100%', height: '100%' }}
                            options={{ minHeight: 4 }}
                        />
                    )}
                    {!audioTrack && (
                        <div className="flex items-center gap-1 h-full justify-center">
                            {[2, 4, 2, 4, 2].map((h, i) => (
                                <div key={i} className="w-1 bg-purple-600 opacity-40 rounded-full" style={{ height: `${h * 4}px` }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Trạng thái agent */}
            <div className="mt-4 bg-purple-900/50 px-4 py-1 rounded-full border border-purple-700 text-sm flex items-center gap-2">
                <span className={state === 'listening' || state === 'speaking' ? 'animate-pulse' : ''}>
                    {(STATE_LABELS[state] || '⏳ ...').split(' ')[0]}
                </span>
                {STATE_LABELS[state]?.split(' ').slice(1).join(' ') || state}
            </div>
        </div>
    );
}