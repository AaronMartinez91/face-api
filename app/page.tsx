"use client";

import { useState, useRef, useEffect } from "react";
import FaceCam from "@/app/components/FaceCam";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useUmbrellaAudio } from "@/hooks/useUmbrellaAudio";
import {
  Camera,
  ShieldCheck,
  ShieldAlert,
  Scan,
  Lock,
  Unlock,
  RotateCcw,
  AlertTriangle,
  UserPlus,
  Trash2,
} from "lucide-react";

type Stage =
  | "initial"
  | "registration"
  | "camera-active"
  | "scanning"
  | "verified"
  | "denied";

export default function UmbrellaLogin() {
  const [stage, setStage] = useState<Stage>("initial");
  const [scanProgress, setScanProgress] = useState(0);
  const [isRegistered, setIsRegistered] = useState(false);
  const faceCamRef = useRef<any>(null);
  const { playBeep, playScanning, playGranted, playDenied, playAmbience } = useUmbrellaAudio();

  // Verificar si ya hay un rostro registrado al cargar
  useEffect(() => {
    const stored = localStorage.getItem("umbrella_face_descriptor");
    if (stored) {
      setIsRegistered(true);
    }
    
    // Sonido ambiente al iniciar (muy sutil)
    const stopAmbience = playAmbience();
    
    return () => {
      if (stopAmbience) stopAmbience();
    };
  }, [playAmbience]);

  const handleStartCamera = () => {
    playBeep();
    setStage("camera-active");
  };

  const handleGoToRegistration = () => {
    playBeep();
    setStage("registration");
  };

  const handleRegister = () => {
    playBeep();
    // Llamar al FaceCam para capturar y guardar
    if (faceCamRef.current) {
      faceCamRef.current.capture("save");
    }
  };

  const handleRegistrationComplete = () => {
    playGranted();
    setIsRegistered(true);
    setStage("camera-active");
  };

  const handleStartScan = () => {
    playScanning();
    setStage("scanning");
    
    // Simular progreso de escaneo
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setScanProgress(progress);
      
      // Beep cada 20%
      if (progress % 20 === 0 && progress < 100) {
        playBeep();
      }
      
      if (progress >= 100) {
        clearInterval(interval);
        // Iniciar verificación real
        if (faceCamRef.current) {
          faceCamRef.current.capture("login");
        }
      }
    }, 30);
  };

  const handleVerified = () => {
    playGranted();
    setStage("verified");
  };

  const handleDenied = () => {
    playDenied();
    setStage("denied");
  };

  const handleReset = () => {
    playBeep();
    setStage("initial");
    setScanProgress(0);
  };

  const handleClearRegistration = () => {
    playBeep();
    if (faceCamRef.current) {
      faceCamRef.current.reset();
    }
    setIsRegistered(false);
    localStorage.removeItem("umbrella_face_descriptor");
  };

  // Vista inicial
  if (stage === "initial") {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(220,38,38,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMjAsMzgsMzgsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
        
        <div className="relative z-10 w-full max-w-md px-6">
          {/* Logo */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-red-950/30 border-2 border-red-900/50 backdrop-blur-sm">
              <div className="w-16 h-16 relative">
                <div className="absolute inset-0 bg-red-600 rounded-full animate-pulse" />
                <ShieldCheck className="w-16 h-16 text-white relative z-10" />
              </div>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white mb-2 umbrella-title">
              UMBRELLA
            </h1>
            <p className="text-red-500 text-sm font-mono tracking-widest">
              CORPORATION
            </p>
            <div className="h-px w-32 mx-auto mt-4 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
          </div>

          <Card className="bg-zinc-950/90 border-red-900/30 backdrop-blur-xl shadow-2xl shadow-red-950/50">
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Biometric Access
                </h2>
                <p className="text-zinc-400 text-sm">
                  Facial recognition authentication required
                </p>
              </div>

              <div className="space-y-4">
                {!isRegistered && (
                  <Alert className="bg-amber-950/30 border-amber-600/50 text-amber-200">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      No biometric data found. Please register your face before attempting login.
                    </AlertDescription>
                  </Alert>
                )}

                {isRegistered && (
                  <Alert className="bg-green-950/30 border-green-600/50 text-green-200">
                    <ShieldCheck className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Biometric profile detected. You may proceed with authentication.
                    </AlertDescription>
                  </Alert>
                )}

                {!isRegistered ? (
                  <Button
                    onClick={handleGoToRegistration}
                    className="w-full h-14 bg-amber-600 hover:bg-amber-700 text-white font-bold tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-amber-600/50"
                    size="lg"
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    REGISTER BIOMETRIC DATA
                  </Button>
                ) : (
                  <Button
                    onClick={handleStartCamera}
                    className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-red-600/50"
                    size="lg"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    INITIALIZE BIOMETRIC SCAN
                  </Button>
                )}

                {isRegistered && (
                  <Button
                    onClick={handleClearRegistration}
                    variant="outline"
                    className="w-full border-zinc-700 text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Registration
                  </Button>
                )}

                <div className="text-center">
                  <p className="text-xs text-zinc-600 font-mono">
                    CLEARANCE LEVEL: CLASSIFIED
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="mt-8 text-center text-xs text-zinc-700 font-mono">
            <p>UMBRELLA SECURE ACCESS TERMINAL v3.7.2</p>
            <p className="mt-1">© 2026 Umbrella Corporation. All rights reserved.</p>
          </div>
        </div>

        <style jsx>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.8s ease-out;
          }
          .umbrella-title {
            text-shadow: 0 0 20px rgba(220, 38, 38, 0.5);
          }
        `}</style>
      </div>
    );
  }

  // Vista de registro
  if (stage === "registration") {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(220,38,38,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMjAsMzgsMzgsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />

        <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                BIOMETRIC REGISTRATION
              </h1>
              <p className="text-zinc-500 text-sm font-mono mt-1">
                Capture and store facial biometric data
              </p>
            </div>
            <Badge
              variant="outline"
              className="bg-amber-950/30 text-amber-400 border-amber-600/50 font-mono"
            >
              <UserPlus className="mr-1 h-3 w-3" />
              REGISTRATION MODE
            </Badge>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-zinc-950/90 border-amber-900/30 backdrop-blur-xl overflow-hidden">
                <FaceCam
                  ref={faceCamRef}
                  onRegistrationSuccess={handleRegistrationComplete}
                  onDenied={handleDenied}
                />
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-zinc-950/90 border-amber-900/30 backdrop-blur-xl">
                <div className="p-6">
                  <h3 className="text-sm font-bold text-white mb-4 tracking-wider">
                    REGISTRATION INSTRUCTIONS
                  </h3>
                  <div className="space-y-2 text-xs text-zinc-400">
                    <p>• Position your face within the frame</p>
                    <p>• Ensure good lighting conditions</p>
                    <p>• Remove eyewear and face coverings</p>
                    <p>• Look directly at the camera</p>
                    <p>• Remain still during capture</p>
                    <p>• Click "Register Face" when ready</p>
                  </div>
                </div>
              </Card>

              <div className="space-y-3">
                <Button
                  onClick={handleRegister}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold"
                  size="lg"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  REGISTER FACE
                </Button>

                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full border-zinc-700 text-zinc-400 hover:bg-zinc-900 hover:text-white"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista de cámara activa y verificación
  if (stage === "camera-active" || stage === "scanning") {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(220,38,38,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMjAsMzgsMzgsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />

        <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                UMBRELLA BIOMETRIC VERIFICATION
              </h1>
              <p className="text-zinc-500 text-sm font-mono mt-1">
                Facial Recognition System Active
              </p>
            </div>
            <Badge
              variant="outline"
              className={`${
                stage === "scanning"
                  ? "bg-amber-950/30 text-amber-400 border-amber-600/50 animate-pulse"
                  : "bg-green-950/30 text-green-400 border-green-600/50"
              } font-mono`}
            >
              {stage === "scanning" ? (
                <>
                  <Scan className="mr-1 h-3 w-3" />
                  SCANNING
                </>
              ) : (
                <>
                  <Camera className="mr-1 h-3 w-3" />
                  READY
                </>
              )}
            </Badge>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Camera Feed */}
            <div className="lg:col-span-2">
              <Card className="bg-zinc-950/90 border-red-900/30 backdrop-blur-xl overflow-hidden">
                <div className="relative">
                  {/* Scanning overlay */}
                  {stage === "scanning" && (
                    <div className="absolute inset-0 z-20 pointer-events-none">
                      <div className="absolute inset-0 border-2 border-red-500 rounded-lg">
                        {/* Corner brackets */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-red-500" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-500" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-red-500" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-red-500" />
                        
                        {/* Scanning line */}
                        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan" />
                      </div>
                      
                      {/* Crosshair center */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="w-32 h-32 border-2 border-red-500 rounded-full opacity-50 animate-ping" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                        </div>
                      </div>
                    </div>
                  )}

                  <FaceCam
                    ref={faceCamRef}
                    onVerified={handleVerified}
                    onDenied={handleDenied}
                  />
                </div>

                {stage === "scanning" && (
                  <div className="p-4 bg-zinc-900/50 border-t border-red-900/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-zinc-400 font-mono">
                        BIOMETRIC ANALYSIS
                      </span>
                      <span className="text-xs text-red-400 font-mono font-bold">
                        {scanProgress}%
                      </span>
                    </div>
                    <Progress
                      value={scanProgress}
                      className="h-2 bg-zinc-800"
                    />
                  </div>
                )}
              </Card>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Status */}
              <Card className="bg-zinc-950/90 border-red-900/30 backdrop-blur-xl">
                <div className="p-6">
                  <h3 className="text-sm font-bold text-white mb-4 tracking-wider">
                    SYSTEM STATUS
                  </h3>
                  <div className="space-y-3">
                    <StatusItem label="Camera" status="online" />
                    <StatusItem label="Face Detection" status="online" />
                    <StatusItem label="Neural Network" status="online" />
                    <StatusItem
                      label="Authentication"
                      status={stage === "scanning" ? "processing" : "standby"}
                    />
                  </div>
                </div>
              </Card>

              {/* Instructions */}
              <Card className="bg-zinc-950/90 border-red-900/30 backdrop-blur-xl">
                <div className="p-6">
                  <h3 className="text-sm font-bold text-white mb-4 tracking-wider">
                    INSTRUCTIONS
                  </h3>
                  <div className="space-y-2 text-xs text-zinc-400">
                    <p>• Position face within frame</p>
                    <p>• Ensure adequate lighting</p>
                    <p>• Remove eyewear if possible</p>
                    <p>• Look directly at camera</p>
                    <p>• Remain still during scan</p>
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <div className="space-y-3">
                {stage === "camera-active" && (
                  <Button
                    onClick={handleStartScan}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
                    size="lg"
                  >
                    <Scan className="mr-2 h-4 w-4" />
                    BEGIN VERIFICATION
                  </Button>
                )}
                
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full border-zinc-700 text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  disabled={stage === "scanning"}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes scan {
            0% {
              top: 0%;
            }
            50% {
              top: 100%;
            }
            100% {
              top: 0%;
            }
          }
          .animate-scan {
            animation: scan 2s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  // Vista de verificación exitosa
  if (stage === "verified") {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgzNCwxOTcsOTQsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />

        <div className="relative z-10 w-full max-w-lg px-6">
          <Card className="bg-zinc-950/90 border-green-900/30 backdrop-blur-xl shadow-2xl shadow-green-950/50 animate-scale-in">
            <div className="p-12 text-center">
              {/* Success Icon */}
              <div className="inline-flex items-center justify-center w-32 h-32 mb-8 rounded-full bg-green-950/30 border-4 border-green-600/50 backdrop-blur-sm animate-pulse-slow">
                <Unlock className="w-16 h-16 text-green-500" />
              </div>

              <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
                ACCESS GRANTED
              </h2>
              <p className="text-green-500 font-mono text-sm mb-8">
                BIOMETRIC VERIFICATION SUCCESSFUL
              </p>

              <div className="space-y-4 mb-8">
                <div className="bg-green-950/20 border border-green-900/50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-left">
                      <p className="text-zinc-500 text-xs mb-1">CLEARANCE</p>
                      <p className="text-white font-bold">LEVEL 5</p>
                    </div>
                    <div className="text-left">
                      <p className="text-zinc-500 text-xs mb-1">CONFIDENCE</p>
                      <p className="text-green-400 font-bold">98.7%</p>
                    </div>
                    <div className="text-left">
                      <p className="text-zinc-500 text-xs mb-1">TIMESTAMP</p>
                      <p className="text-white font-mono text-xs">
                        {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-zinc-500 text-xs mb-1">STATUS</p>
                      <Badge className="bg-green-600 text-white border-0">
                        VERIFIED
                      </Badge>
                    </div>
                  </div>
                </div>

                <Alert className="bg-green-950/20 border-green-900/50 text-green-200 text-left">
                  <ShieldCheck className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Your identity has been confirmed. Access to restricted areas
                    and classified materials is now authorized.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold"
                  size="lg"
                  onClick={playBeep}
                >
                  PROCEED TO SECURE AREA
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full border-zinc-700 text-zinc-400 hover:bg-zinc-900 hover:text-white"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  New Verification
                </Button>
              </div>
            </div>
          </Card>

          <div className="mt-8 text-center text-xs text-zinc-700 font-mono">
            <p>SESSION ID: UMB-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
          </div>
        </div>

        <style jsx>{`
          @keyframes scale-in {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          @keyframes pulse-slow {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.6;
            }
          }
          .animate-scale-in {
            animation: scale-in 0.5s ease-out;
          }
          .animate-pulse-slow {
            animation: pulse-slow 3s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  // Vista de acceso denegado
  if (stage === "denied") {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMjAsMzgsMzgsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />

        <div className="relative z-10 w-full max-w-lg px-6">
          <Card className="bg-zinc-950/90 border-red-900/30 backdrop-blur-xl shadow-2xl shadow-red-950/50 animate-shake">
            <div className="p-12 text-center">
              {/* Denied Icon */}
              <div className="inline-flex items-center justify-center w-32 h-32 mb-8 rounded-full bg-red-950/30 border-4 border-red-600/50 backdrop-blur-sm animate-pulse-slow">
                <Lock className="w-16 h-16 text-red-500" />
              </div>

              <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
                ACCESS DENIED
              </h2>
              <p className="text-red-500 font-mono text-sm mb-8">
                BIOMETRIC VERIFICATION FAILED
              </p>

              <div className="space-y-4 mb-8">
                <Alert className="bg-red-950/20 border-red-900/50 text-red-200 text-left">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Your facial biometric data does not match any authorized
                    personnel in the Umbrella Corporation database. This
                    incident has been logged.
                  </AlertDescription>
                </Alert>

                <div className="bg-red-950/20 border border-red-900/50 rounded-lg p-4">
                  <div className="space-y-2 text-sm text-left">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Reason:</span>
                      <span className="text-red-400 font-mono">
                        NO MATCH FOUND
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Timestamp:</span>
                      <span className="text-white font-mono text-xs">
                        {new Date().toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Attempts:</span>
                      <span className="text-red-400 font-bold">1/3</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleReset}
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold"
                  size="lg"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  RETRY VERIFICATION
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-zinc-700 text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  onClick={playBeep}
                >
                  Request Support
                </Button>
              </div>
            </div>
          </Card>

          <div className="mt-8 text-center text-xs text-red-900 font-mono">
            <p>⚠ SECURITY ALERT LOGGED</p>
          </div>
        </div>

        <style jsx>{`
          @keyframes shake {
            0%, 100% {
              transform: translateX(0);
            }
            10%, 30%, 50%, 70%, 90% {
              transform: translateX(-5px);
            }
            20%, 40%, 60%, 80% {
              transform: translateX(5px);
            }
          }
          @keyframes pulse-slow {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.6;
            }
          }
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
          .animate-pulse-slow {
            animation: pulse-slow 3s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return null;
}

function StatusItem({
  label,
  status,
}: {
  label: string;
  status: "online" | "offline" | "standby" | "processing";
}) {
  const statusConfig = {
    online: { color: "bg-green-500", text: "ONLINE", pulse: true },
    offline: { color: "bg-red-500", text: "OFFLINE", pulse: false },
    standby: { color: "bg-amber-500", text: "STANDBY", pulse: false },
    processing: { color: "bg-blue-500", text: "PROCESSING", pulse: true },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-zinc-400">{label}</span>
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${config.color} ${
            config.pulse ? "animate-pulse" : ""
          }`}
        />
        <span className="text-xs text-zinc-300 font-mono">{config.text}</span>
      </div>
    </div>
  );
}