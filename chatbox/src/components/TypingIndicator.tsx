import React from 'react';

const TypingIndicator: React.FC = () => {
    return (
        <div className="inline-flex">
            <span className="typing-dot"></span>
            <span className="typing-dot typing-dot-2"></span>
            <span className="typing-dot typing-dot-3"></span>
        </div>
    );
};

export default TypingIndicator;
