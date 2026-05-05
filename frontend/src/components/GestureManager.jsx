import React, { useRef, useEffect } from 'react';
import Webcam from 'react-webcam';

const GestureManager = ({ onGesture }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const onGestureRef = useRef(onGesture);
  const requestRef = useRef(null);
  
  const stateRef = useRef({
    pinchFrames: 0,
    smoothX: 0.5,
    smoothY: 0.5,
    isActive: true
  });

  useEffect(() => {
    onGestureRef.current = onGesture;
  }, [onGesture]);

  useEffect(() => {
    let hands = null;
    stateRef.current.isActive = true;

    const initHands = () => {
      if (!window.Hands) {
        setTimeout(initHands, 500);
        return;
      }

      hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.75,
        minTrackingConfidence: 0.75,
      });

      hands.onResults((results) => {
        if (!canvasRef.current || !stateRef.current.isActive) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (results.multiHandLandmarks?.length > 0) {
          const lm = results.multiHandLandmarks[0];
          const indexTip = lm[8];
          const thumbTip = lm[4];
          
          // Midpoint tracking for highest stability
          const targetX = (indexTip.x + thumbTip.x) / 2;
          const targetY = (indexTip.y + thumbTip.y) / 2;

          const s = stateRef.current;
          const alpha = 0.5; // Perfectly balanced smoothing
          s.smoothX = s.smoothX + (targetX - s.smoothX) * alpha;
          s.smoothY = s.smoothY + (targetY - s.smoothY) * alpha;

          // Stable Pinch detection
          const wrist = lm[0];
          const indexBase = lm[5];
          const handSize = Math.sqrt(Math.pow(wrist.x - indexBase.x, 2) + Math.pow(wrist.y - indexBase.y, 2));
          const dist = Math.sqrt(Math.pow(indexTip.x - thumbTip.x, 2) + Math.pow(indexTip.y - thumbTip.y, 2));
          const isPinching = (dist / Math.max(handSize, 0.01)) < 0.38;

          if (isPinching) {
            s.pinchFrames = Math.min(s.pinchFrames + 1, 3);
          } else {
            s.pinchFrames = 0;
          }
          const confirmed = s.pinchFrames >= 2;

          onGestureRef.current(confirmed ? 'PINCH' : 'MOVE', {
            x: s.smoothX,
            y: s.smoothY,
          });

          // Draw Full 21-Mark Skeleton (Developer Feedback Mode)
          const connections = [[0,1],[1,2],[2,3],[3,4],[5,6],[6,7],[7,8],[9,10],[10,11],[11,12],[13,14],[14,15],[15,16],[17,18],[18,19],[19,20],[0,5],[5,9],[9,13],[13,17],[0,17]];
          
          ctx.strokeStyle = 'rgba(0, 239, 255, 0.2)';
          ctx.lineWidth = 1;
          for (const [a, b] of connections) {
            ctx.beginPath();
            ctx.moveTo(lm[a].x * canvas.width, lm[a].y * canvas.height);
            ctx.lineTo(lm[b].x * canvas.width, lm[b].y * canvas.height);
            ctx.stroke();
          }

          [4, 8, 12, 16, 20].forEach(idx => {
            ctx.fillStyle = (idx === 8 && confirmed) ? '#ff3333' : '#00efff';
            ctx.beginPath();
            ctx.arc(lm[idx].x * canvas.width, lm[idx].y * canvas.height, 5, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      });

      const processFrame = async () => {
        if (!stateRef.current.isActive) return;
        const video = webcamRef.current?.video;
        if (video && video.readyState >= 2 && video.videoWidth > 0) {
          try {
            await hands.send({ image: video });
          } catch (e) {}
        }
        requestRef.current = requestAnimationFrame(processFrame);
      };
      requestRef.current = requestAnimationFrame(processFrame);
    };

    initHands();

    return () => {
      stateRef.current.isActive = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] rounded-none overflow-hidden shadow-2xl bg-black/90 border-2 border-cyan-500/80">
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[9px] font-black px-2 py-0.5 text-center tracking-widest z-10">
        ✋ GESTURE CONTROL
      </div>
      <Webcam
        ref={webcamRef}
        mirrored={true}
        style={{ width: 300, height: 225, opacity: 0.7, display: 'block', objectFit: 'cover' }}
        videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
      />
      <canvas
        ref={canvasRef}
        width={300}
        height={225}
        className="absolute top-0 left-0"
        style={{ width: 300, height: 225, transform: 'scaleX(-1)', objectFit: 'cover' }}
      />
    </div>
  );
};

export default GestureManager;
