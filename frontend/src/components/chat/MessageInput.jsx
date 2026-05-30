import { useState } from 'react';

export default function MessageInput() {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (!text.trim()) return;
        // TODO: Send text message to agent via LiveKit data channel
        setText('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div style={{ width: '100%', marginTop: '0.5rem' }}>
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message Jarvis..."
                    style={{
                        width: '100%',
                        fontFamily: "'Comfortaa', sans-serif",
                        fontSize: '0.8rem',
                        background: '#FFFFFF',
                        border: '2px solid #BD7171',
                        borderRadius: '12px',
                        padding: '0.65rem 2.5rem 0.65rem 1rem',
                        color: '#5a3e3e',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = '#FF8FAB';
                        e.target.style.boxShadow = '0 0 8px rgba(255, 143, 171, 0.3)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = '#BD7171';
                        e.target.style.boxShadow = 'none';
                    }}
                />
                <button
                    onClick={handleSend}
                    style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#D09494',
                        fontSize: '1.1rem',
                        padding: '4px',
                        transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#BD7171'}
                    onMouseLeave={(e) => e.target.style.color = '#D09494'}
                    title="Send"
                >
                    ➤
                </button>
            </div>
        </div>
    );
}