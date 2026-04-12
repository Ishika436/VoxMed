import { useState, useRef, useCallback } from "react";
import { Mic, Square, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { analyzeVoiceBiomarkers } from "@/lib/voiceAnalysis";
import { toast } from "sonner";
import GlassCard from "@/components/GlassCard";
import WaveformVisualizer from "@/components/WaveformVisualizer";

const RECORDING_DURATION = 15;

const RecordPage = () => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(RECORDING_DURATION);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);
  const [notes, setNotes] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      audioContextRef.current = audioContext;
      setAnalyserNode(analyser);

      const mediaRecorder = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await processRecording(blob, audioContext.sampleRate);
        audioContext.close();
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setTimeLeft(RECORDING_DURATION);
      setLastResult(null);

      let remaining = RECORDING_DURATION;
      timerRef.current = setInterval(() => {
        remaining--;
        setTimeLeft(remaining);
        if (remaining <= 0) {
          clearInterval(timerRef.current);
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 1000);
    } catch (err) {
      toast.error("Microphone access denied. Please allow microphone permissions.");
    }
  }, []);

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const processRecording = async (blob: Blob, sampleRate: number) => {
    if (!user) return;
    setIsAnalyzing(true);

    try {
      // Decode audio for analysis
      const arrayBuffer = await blob.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);
      audioContext.close();

      // Analyze biomarkers
      const result = analyzeVoiceBiomarkers(channelData, sampleRate);

      // Save recording
      const { data: recording, error: recError } = await supabase
        .from("voice_recordings")
        .insert({ user_id: user.id, duration_seconds: RECORDING_DURATION, notes: notes || null })
        .select()
        .single();

      if (recError) throw recError;

      // Save analysis
      const { error: analysisError } = await supabase
        .from("biomarker_analyses")
        .insert({ ...result, recording_id: recording.id, user_id: user.id });

      if (analysisError) throw analysisError;

      // Create alert if anomaly detected
      if (result.anomaly_detected && result.anomaly_details) {
        await supabase.from("health_alerts").insert({
          user_id: user.id,
          alert_type: "anomaly",
          severity: result.overall_health_score < 30 ? "high" : "medium",
          message: result.anomaly_details,
        });
      }

      setLastResult(result);
      toast.success("Voice analysis complete!");
    } catch (err: any) {
      toast.error("Analysis failed: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const progress = ((RECORDING_DURATION - timeLeft) / RECORDING_DURATION) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">Voice Diary</h1>
        <p className="text-muted-foreground mt-1">Record a 15-second voice sample for AI analysis</p>
      </div>

      {/* Recorder */}
      <GlassCard glow={isRecording} className="text-center">
        <div className="mb-6">
          <WaveformVisualizer analyserNode={analyserNode} isRecording={isRecording} />
        </div>

        {/* Timer ring */}
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(215, 20%, 18%)" strokeWidth="3" />
            <circle
              cx="50" cy="50" r="45" fill="none"
              stroke="hsl(185, 100%, 50%)"
              strokeWidth="3"
              strokeDasharray={`${progress * 2.83} 283`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-4xl font-bold">{timeLeft}</span>
            <span className="text-xs text-muted-foreground font-mono">seconds</span>
          </div>
        </div>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isAnalyzing}
          className={`inline-flex items-center gap-3 px-8 py-4 rounded-full font-display font-semibold text-sm tracking-wider transition-all ${
            isRecording
              ? "bg-destructive text-destructive-foreground hover:opacity-90"
              : "gradient-primary text-primary-foreground hover:opacity-90 animate-pulse-glow"
          } disabled:opacity-50`}
        >
          {isAnalyzing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> ANALYZING...</>
          ) : isRecording ? (
            <><Square className="w-5 h-5" /> STOP RECORDING</>
          ) : (
            <><Mic className="w-5 h-5" /> START RECORDING</>
          )}
        </button>

        <div className="mt-6">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional: How are you feeling today?"
            className="w-full max-w-md mx-auto px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            rows={2}
          />
        </div>
      </GlassCard>

      {/* Results */}
      {lastResult && (
        <GlassCard className="animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-6 h-6 text-success" />
            <h2 className="font-display text-lg font-semibold">Analysis Results</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: "Tremor Score", value: lastResult.tremor_score, max: 100 },
              { label: "Breathlessness", value: lastResult.breathlessness_score, max: 100 },
              { label: "Pitch Mean (Hz)", value: lastResult.pitch_mean, max: 500 },
              { label: "Pitch Variation", value: lastResult.pitch_variation, max: 100 },
              { label: "Speech Rate", value: lastResult.speech_rate, max: 100 },
              { label: "Pause Patterns", value: lastResult.pause_pattern_score, max: 100 },
            ].map((m) => (
              <div key={m.label} className="p-4 rounded-lg bg-secondary/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono text-muted-foreground">{m.label}</span>
                  <span className="font-display font-bold text-primary">{m.value}</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full gradient-primary transition-all duration-1000"
                    style={{ width: `${(m.value / m.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className={`p-4 rounded-lg ${lastResult.anomaly_detected ? "bg-destructive/10 border border-destructive/30" : "bg-success/10 border border-success/30"}`}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${lastResult.anomaly_detected ? "bg-destructive" : "bg-success"} animate-pulse`} />
              <span className="font-display font-semibold text-sm">
                Overall Health Score: {lastResult.overall_health_score}%
              </span>
            </div>
            {lastResult.anomaly_details && (
              <p className="text-sm text-muted-foreground mt-2">{lastResult.anomaly_details}</p>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default RecordPage;
