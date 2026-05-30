import { useVoiceAssistant } from '@livekit/components-react';

const STATE_LABELS = {
    connecting: 'Connecting',
    initializing: 'Initializing',
    listening: 'Listening',
    thinking: 'Thinking',
    speaking: 'Speaking',
    idle: 'Idle',
};

export default function Visualizer() {
    const { state } = useVoiceAssistant();

    return (
        <div className={`status-badge ${state === 'speaking' || state === 'listening' ? 'connected' : ''}`}>
            {STATE_LABELS[state] || state || '...'}
        </div>
    );
}