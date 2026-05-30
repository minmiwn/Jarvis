import { useVoiceAssistant, useLocalParticipant, useTrackTranscription, useChat } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useMemo, useRef, useEffect } from 'react';

export default function MessageList() {
    const { agentTranscriptions } = useVoiceAssistant();
    const { localParticipant, microphoneTrack } = useLocalParticipant();
    const { chatMessages } = useChat();

    // Build a TrackReference for the local mic so useTrackTranscription can read it
    const localMicTrackRef = useMemo(() => {
        if (microphoneTrack?.track) {
            return {
                participant: localParticipant,
                publication: microphoneTrack,
                source: Track.Source.Microphone,
            };
        }
        return undefined;
    }, [localParticipant, microphoneTrack]);

    const { segments: userSegments } = useTrackTranscription(localMicTrackRef);

    // Merge agent + user transcriptions + chat messages, sorted by time
    const messages = useMemo(() => {
        const agentMsgs = (agentTranscriptions || []).map(t => ({
            id: `agent-${t.id}`,
            role: 'assistant',
            text: t.text,
            final: t.final,
            timestamp: t.firstReceivedTime ?? 0,
        }));

        const userMsgs = (userSegments || []).map(t => ({
            id: `user-${t.id}`,
            role: 'user',
            text: t.text,
            final: t.final,
            timestamp: t.firstReceivedTime ?? 0,
        }));

        const chatMsgs = (chatMessages || []).map(msg => ({
            id: `chat-${msg.id || msg.timestamp}`,
            role: msg.from?.isLocal ? 'user' : 'assistant',
            text: msg.message,
            final: true,
            timestamp: msg.timestamp,
        }));

        return [...agentMsgs, ...userMsgs, ...chatMsgs].sort((a, b) => a.timestamp - b.timestamp);
    }, [agentTranscriptions, userSegments, chatMessages]);

    // Auto-scroll to bottom
    const boxRef = useRef(null);
    useEffect(() => {
        if (boxRef.current) {
            boxRef.current.scrollTop = boxRef.current.scrollHeight;
        }
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="chat-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D09494' }}>
                <p>Hãy nói gì đó để bắt đầu... 🌸</p>
            </div>
        );
    }

    return (
        <div className="chat-box" ref={boxRef}>
            {messages.map((msg) => (
                <div key={msg.id} style={{ marginBottom: '0.4rem' }}>
                    {msg.role === 'user' ? (
                        <p style={{ opacity: msg.final ? 1 : 0.6 }}>
                            <span className="user-dot" />
                            <span style={{ fontWeight: 600, color: '#BD7171' }}>User : </span>
                            <span>{msg.text}</span>
                            {!msg.final && <span style={{ animation: 'pulse 1.5s infinite' }}> ...</span>}
                        </p>
                    ) : (
                        <p style={{ opacity: msg.final ? 1 : 0.7 }}>
                            <span style={{ fontWeight: 600, color: '#8B6060' }}>Jarvis : </span>
                            <span>{msg.text}</span>
                            {!msg.final && <span style={{ animation: 'pulse 1.5s infinite' }}> ▌</span>}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}