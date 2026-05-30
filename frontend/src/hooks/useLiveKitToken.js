import { useState, useCallback } from 'react';

const TOKEN_SERVER = import.meta.env.VITE_TOKEN_SERVER_URL || 'http://localhost:8000';

export function useLiveKitToken() {
    const [token, setToken] = useState(null);
    const [url, setUrl] = useState(import.meta.env.VITE_LIVEKIT_URL);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchToken = useCallback(async (roomName = 'jarvis-room', participantName = 'user') => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${TOKEN_SERVER}/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ room_name: roomName, participant_name: participantName }),
            });
            if (!res.ok) throw new Error(`Token server error: ${res.status}`);
            const data = await res.json();
            setToken(data.token);
            if (data.url) {
                setUrl(data.url);
            }
            return data.token;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const disconnect = useCallback(() => {
        setToken(null);
        setError(null);
    }, []);

    return { token, url, loading, error, fetchToken, disconnect };
}
