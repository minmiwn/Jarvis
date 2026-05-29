import { useVoiceAssistant } from '@livekit/components-react';

export default function MessageList() {
    const { agentTranscriptions } = useVoiceAssistant();


    // Kết hợp transcript của agent và user, sắp xếp theo thời gian
    const messages = (agentTranscriptions || []).map(t => ({
        id: t.id,
        role: t.role || 'assistant', // 'user' hoặc 'assistant'
        text: t.text,
        final: t.final,
        timestamp: t.firstReceivedTime,
    }));

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-600 text-sm gap-2">
                <span className="text-2xl">💬</span>
                <p>Hãy nói gì đó để bắt đầu...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto mb-20 pr-2 mt-6">
            {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={`flex flex-col max-w-[70%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}
                >
                    {msg.role === 'user' ? (
                        /* Tin nhắn của User */
                        <div className="bg-purple-700 p-4 rounded-xl rounded-tr-none shadow-lg">
                            <p className={`text-sm ${!msg.final ? 'opacity-60 italic' : ''}`}>
                                {msg.text}
                                {!msg.final && <span className="ml-1 animate-pulse">...</span>}
                            </p>
                        </div>
                    ) : (
                        /* Tin nhắn của Jarvis */
                        <div className="border border-purple-700 bg-purple-900/40 p-4 rounded-xl rounded-tl-none shadow-lg">
                            <p className={`text-sm ${!msg.final ? 'opacity-70 italic' : ''}`}>
                                {msg.text}
                                {!msg.final && <span className="ml-1 animate-pulse">▌</span>}
                            </p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}