"use client";

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import * as faceapi from "face-api.js";

interface FaceCamProps {
  onVerified?: () => void;
  onDenied?: () => void;
  onRegistrationSuccess?: () => void; // Nueva prop para callback de registro
}

export interface FaceCamHandle {
  capture: (mode: "save" | "login") => void;
  reset: () => void;
}

const FaceCam = forwardRef<FaceCamHandle, FaceCamProps>(
  ({ onVerified, onDenied, onRegistrationSuccess }, ref) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [cameraReady, setCameraReady] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [distance, setDistance] = useState<number | null>(null);

    // Exponer métodos al componente padre
    useImperativeHandle(ref, () => ({
      capture: (mode: "save" | "login") => {
        capture(mode);
      },
      reset: () => {
        resetRegisteredFace();
      },
    }));

    // Cargar modelos
    async function loadModels() {
      try {
        setError(null);
        const MODEL_URL = "/models";

        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

        setModelsLoaded(true);
      } catch (e) {
        console.error(e);
        setError(
          "Failed to load AI models. Please check /public/models directory."
        );
      }
    }

    function euclideanDistance(a: number[], b: number[]) {
      return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
    }

    // Analizar canvas y guardar descriptor (REGISTRO)
    async function analyzeSnapshotAndSave() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (!modelsLoaded) {
        setError("AI models not loaded yet.");
        return;
      }

      setInfo(null);
      setDistance(null);

      const detection = await faceapi
        .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setError(
          "No face detected. Please ensure good lighting and look at the camera."
        );
        return;
      }

      setError(null);

      const descriptor = Array.from(detection.descriptor);
      localStorage.setItem("umbrella_face_descriptor", JSON.stringify(descriptor));

      setInfo("✅ REGISTRATION SUCCESSFUL: Face captured and biometric data stored.");
      
      // Llamar al callback después de un pequeño delay para mostrar el mensaje
      if (onRegistrationSuccess) {
        setTimeout(() => {
          onRegistrationSuccess();
        }, 1500);
      }
    }

    // LOGIN: comparar descriptor actual con el guardado
    async function loginWithFace() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (!modelsLoaded) {
        setError("AI models not loaded yet.");
        return;
      }

      const stored = localStorage.getItem("umbrella_face_descriptor");
      if (!stored) {
        setError(
          "No registered face found. Please capture and register first."
        );
        if (onDenied) onDenied();
        return;
      }

      setInfo(null);
      setDistance(null);

      const storedDescriptor = JSON.parse(stored) as number[];

      const detection = await faceapi
        .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setError("No face detected during verification.");
        if (onDenied) onDenied();
        return;
      }

      const currentDescriptor = Array.from(detection.descriptor);
      const d = euclideanDistance(storedDescriptor, currentDescriptor);
      setDistance(d);

      const THRESHOLD = 0.55;

      if (d < THRESHOLD) {
        setError(null);
        setInfo(`✅ VERIFICATION SUCCESSFUL (confidence: ${(1 - d).toFixed(3)})`);
        if (onVerified) {
          setTimeout(() => onVerified(), 800);
        }
      } else {
        setInfo(null);
        setError(`❌ VERIFICATION FAILED (confidence too low: ${(1 - d).toFixed(3)})`);
        if (onDenied) {
          setTimeout(() => onDenied(), 800);
        }
      }
    }

    // Capturar frame del vídeo al canvas
    function capture(then: "save" | "login") {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const w = video.videoWidth;
      const h = video.videoHeight;

      if (!w || !h) {
        setError("Camera not ready yet (video dimensions are 0).");
        return;
      }

      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, w, h);

      if (then === "save") analyzeSnapshotAndSave();
      if (then === "login") loginWithFace();
    }

    function resetRegisteredFace() {
      localStorage.removeItem("umbrella_face_descriptor");
      setError(null);
      setInfo("🗑️ Registration cleared. You can register a new face.");
      setDistance(null);
    }

    // Arrancar cámara + cargar modelos
    useEffect(() => {
      async function startCamera() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user", width: 1280, height: 720 },
            audio: false,
          });

          streamRef.current = stream;

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            
            // Esperar a que el video esté listo antes de reproducir
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().then(() => {
                setCameraReady(true);
                setError(null); // Limpiar error si había
              }).catch((err) => {
                console.error("Error playing video:", err);
              });
            };
          }
        } catch (e) {
          console.error("Camera error:", e);
          setError(
            "Cannot access camera. Please check browser permissions."
          );
        }
      }

      startCamera();
      loadModels();

      return () => {
        // Limpiar stream al desmontar
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }
      };
    }, []);

    return (
      <div className="relative w-full">
        {/* Status indicators */}
        <div className="absolute top-4 left-4 z-30 space-y-2">
          {!cameraReady && !error && (
            <div className="bg-amber-950/90 border border-amber-600/50 backdrop-blur-sm px-3 py-1 rounded text-xs text-amber-400 font-mono">
              ⏳ Initializing camera...
            </div>
          )}
          {!modelsLoaded && (
            <div className="bg-blue-950/90 border border-blue-600/50 backdrop-blur-sm px-3 py-1 rounded text-xs text-blue-400 font-mono">
              ⏳ Loading AI models...
            </div>
          )}
          {cameraReady && modelsLoaded && !error && (
            <div className="bg-green-950/90 border border-green-600/50 backdrop-blur-sm px-3 py-1 rounded text-xs text-green-400 font-mono animate-pulse">
              ✓ System ready
            </div>
          )}
        </div>

        {/* Messages */}
        {error && !cameraReady && (
          <div className="absolute top-4 right-4 z-30 max-w-xs">
            <div className="bg-red-950/90 border border-red-600/50 backdrop-blur-sm px-4 py-2 rounded text-xs text-red-200">
              {error}
            </div>
          </div>
        )}

        {error && cameraReady && (
          <div className="absolute bottom-4 left-4 right-4 z-30">
            <div className="bg-red-950/90 border border-red-600/50 backdrop-blur-sm px-4 py-2 rounded text-xs text-red-200 text-center">
              {error}
            </div>
          </div>
        )}

        {info && (
          <div className="absolute bottom-4 left-4 right-4 z-30">
            <div className="bg-green-950/90 border border-green-600/50 backdrop-blur-sm px-4 py-2 rounded text-xs text-green-200 text-center">
              {info}
            </div>
          </div>
        )}

        {distance !== null && (
          <div className="absolute top-4 right-4 z-30">
            <div className="bg-zinc-950/90 border border-zinc-600/50 backdrop-blur-sm px-3 py-1 rounded text-xs text-zinc-300 font-mono">
              Distance: {distance.toFixed(3)}
            </div>
          </div>
        )}

        {/* Video feed */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="w-full rounded-lg border border-red-900/30"
          style={{ transform: "scaleX(-1)" }}
        />

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }
);

FaceCam.displayName = "FaceCam";

export default FaceCam;