import { useEffect, useRef } from "react";

interface WaveformVisualizerProps {
  analyserNode: AnalyserNode | null;
  isRecording: boolean;
}

const WaveformVisualizer = ({ analyserNode, isRecording }: WaveformVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (analyserNode && isRecording) {
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserNode.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 2;
        ctx.strokeStyle = "hsl(185, 100%, 50%)";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "hsl(185, 100%, 50%)";
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      } else {
        // Idle animation
        ctx.strokeStyle = "hsl(215, 20%, 25%)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
          const y = canvas.height / 2 + Math.sin(x * 0.02 + Date.now() * 0.001) * 5;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [analyserNode, isRecording]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={120}
      className="w-full h-[120px] rounded-lg bg-secondary/30"
    />
  );
};

export default WaveformVisualizer;
