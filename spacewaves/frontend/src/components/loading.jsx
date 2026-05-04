import React, { useEffect } from 'react';

const Loading = ({ onFinished }) => {
    useEffect(() => {
        const timer = setTimeout(() => onFinished(), 3000);
        return () => clearTimeout(timer);
    }, [onFinished]);

    return (
        <div className="loading-container">
            <div className="custom-loader"></div>
            <h1 className="loading-text">SPACE WAVES</h1>

            <style>{`
        .loading-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .custom-loader {
          width: 80px; height: 80px;
          border: 10px solid #a393eb;
          border-top: 10px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        .loading-text { margin-top: 30px; letter-spacing: 8px; font-size: 2rem; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};

export default Loading;