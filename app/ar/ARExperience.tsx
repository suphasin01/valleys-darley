"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type CameraFacing = "environment" | "user";
type ExperienceState = "intro" | "loading" | "live" | "error";

type Point = { x: number; y: number; z?: number };

const ringStyles = [
  { id: "silver", name: "Sterling", color: "#e9ecef", gem: "#e8fbff" },
  { id: "onyx", name: "Onyx", color: "#6e7175", gem: "#18191b" },
  { id: "rose", name: "Rose", color: "#e4aaa1", gem: "#fff2ef" },
];

function drawRing(
  context: CanvasRenderingContext2D,
  landmarks: Point[],
  videoWidth: number,
  videoHeight: number,
  scale: number,
  offsetX: number,
  offsetY: number,
  mirrored: boolean,
  style: (typeof ringStyles)[number],
  size: number,
) {
  const mapPoint = (point: Point) => ({
    x: offsetX + (mirrored ? 1 - point.x : point.x) * videoWidth * scale,
    y: offsetY + point.y * videoHeight * scale,
  });

  const base = mapPoint(landmarks[13]);
  const joint = mapPoint(landmarks[14]);
  const palmIndex = mapPoint(landmarks[5]);
  const palmPinky = mapPoint(landmarks[17]);
  const palmWidth = Math.hypot(palmIndex.x - palmPinky.x, palmIndex.y - palmPinky.y);
  const width = Math.max(25, palmWidth * 0.28 * size);
  const height = width * 0.38;
  const x = base.x * 0.56 + joint.x * 0.44;
  const y = base.y * 0.56 + joint.y * 0.44;
  const fingerAngle = Math.atan2(joint.y - base.y, joint.x - base.x);

  context.save();
  context.translate(x, y);
  context.rotate(fingerAngle + Math.PI / 2);
  context.shadowColor = "rgba(0, 0, 0, .34)";
  context.shadowBlur = width * 0.18;
  context.shadowOffsetY = width * 0.08;

  const metal = context.createLinearGradient(-width / 2, 0, width / 2, 0);
  metal.addColorStop(0, "#5f6164");
  metal.addColorStop(0.18, style.color);
  metal.addColorStop(0.45, "#ffffff");
  metal.addColorStop(0.7, style.color);
  metal.addColorStop(1, "#55575a");

  context.beginPath();
  context.ellipse(0, 0, width / 2, height / 2, 0, 0, Math.PI * 2);
  context.lineWidth = Math.max(5, width * 0.14);
  context.strokeStyle = metal;
  context.stroke();

  const gemSize = width * 0.33;
  context.shadowColor = "rgba(255,255,255,.8)";
  context.shadowBlur = gemSize * 0.7;
  context.beginPath();
  for (let index = 0; index < 8; index += 1) {
    const angle = (Math.PI * 2 * index) / 8 - Math.PI / 8;
    const radius = index % 2 ? gemSize * 0.38 : gemSize * 0.52;
    const gemX = Math.cos(angle) * radius;
    const gemY = -height * 0.62 + Math.sin(angle) * radius;
    if (index === 0) context.moveTo(gemX, gemY);
    else context.lineTo(gemX, gemY);
  }
  context.closePath();
  const gem = context.createLinearGradient(-gemSize, -height, gemSize, 0);
  gem.addColorStop(0, "#ffffff");
  gem.addColorStop(0.42, style.gem);
  gem.addColorStop(1, style.id === "onyx" ? "#050505" : "#9ba6ad");
  context.fillStyle = gem;
  context.fill();
  context.lineWidth = Math.max(1.5, width * 0.035);
  context.strokeStyle = "rgba(255,255,255,.9)";
  context.stroke();
  context.restore();
}

export default function ARExperience() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<{ detectForVideo: (video: HTMLVideoElement, timestamp: number) => { landmarks: Point[][] }; close: () => void } | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const latestLandmarksRef = useRef<Point[][]>([]);
  const facingRef = useRef<CameraFacing>("environment");
  const styleRef = useRef(ringStyles[0]);
  const ringSizeRef = useRef(1);
  const [state, setState] = useState<ExperienceState>("intro");
  const [error, setError] = useState("");
  const [facing, setFacing] = useState<CameraFacing>("environment");
  const [styleIndex, setStyleIndex] = useState(0);
  const [ringSize, setRingSize] = useState(1);
  const [handFound, setHandFound] = useState(false);

  useEffect(() => {
    facingRef.current = facing;
  }, [facing]);

  useEffect(() => {
    styleRef.current = ringStyles[styleIndex];
  }, [styleIndex]);

  useEffect(() => {
    ringSizeRef.current = ringSize;
  }, [ringSize]);

  const stopCamera = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const renderFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      frameRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) return;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    const targetWidth = Math.round(displayWidth * pixelRatio);
    const targetHeight = Math.round(displayHeight * pixelRatio);
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const coverScale = Math.max(canvas.width / videoWidth, canvas.height / videoHeight);
    const drawWidth = videoWidth * coverScale;
    const drawHeight = videoHeight * coverScale;
    const offsetX = (canvas.width - drawWidth) / 2;
    const offsetY = (canvas.height - drawHeight) / 2;
    const mirrored = facingRef.current === "user";

    context.save();
    if (mirrored) {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
    } else {
      context.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
    }
    context.restore();

    if (detectorRef.current && video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      latestLandmarksRef.current = detectorRef.current.detectForVideo(video, performance.now()).landmarks;
      setHandFound(latestLandmarksRef.current.length > 0);
    }

    const hand = latestLandmarksRef.current[0];
    if (hand) {
      drawRing(context, hand, videoWidth, videoHeight, coverScale, offsetX, offsetY, mirrored, styleRef.current, ringSizeRef.current);
    }

    frameRef.current = requestAnimationFrame(renderFrame);
  }, []);

  const initialiseDetector = useCallback(async () => {
    if (detectorRef.current) return;
    const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision");
    const vision = await FilesetResolver.forVisionTasks("/mediapipe");
    const options = {
      baseOptions: {
        modelAssetPath: "/models/hand_landmarker.task",
        delegate: "GPU" as const,
      },
      runningMode: "VIDEO" as const,
      numHands: 1,
      minHandDetectionConfidence: 0.55,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    };
    try {
      detectorRef.current = await HandLandmarker.createFromOptions(vision, options);
    } catch {
      detectorRef.current = await HandLandmarker.createFromOptions(vision, {
        ...options,
        baseOptions: { ...options.baseOptions, delegate: "CPU" },
      });
    }
  }, []);

  const startCamera = useCallback(async (nextFacing: CameraFacing = facingRef.current) => {
    setState("loading");
    setError("");
    stopCamera();
    try {
      if (!window.isSecureContext && window.location.hostname !== "localhost") {
        throw new Error("กรุณาเปิดหน้านี้ผ่าน HTTPS เพื่ออนุญาตการใช้กล้อง");
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("เบราว์เซอร์นี้ยังไม่รองรับการเปิดกล้อง กรุณาใช้ Safari หรือ Chrome เวอร์ชันล่าสุด");
      }

      const [stream] = await Promise.all([
        navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: nextFacing },
            width: { ideal: 1280 },
            height: { ideal: 1920 },
          },
          audio: false,
        }),
        initialiseDetector(),
      ]);

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("ไม่สามารถเริ่มตัวแสดงผลกล้องได้");
      video.srcObject = stream;
      await video.play();
      lastVideoTimeRef.current = -1;
      latestLandmarksRef.current = [];
      setState("live");
      frameRef.current = requestAnimationFrame(renderFrame);
    } catch (cause) {
      stopCamera();
      const message = cause instanceof Error ? cause.message : "ไม่สามารถเปิดกล้องได้";
      const permissionMessage = message.toLowerCase().includes("permission") || message.toLowerCase().includes("denied")
        ? "ยังไม่ได้รับอนุญาตให้ใช้กล้อง กรุณาเปิดสิทธิ์ Camera ในการตั้งค่าเบราว์เซอร์แล้วลองอีกครั้ง"
        : message;
      setError(permissionMessage);
      setState("error");
    }
  }, [initialiseDetector, renderFrame, stopCamera]);

  const switchCamera = useCallback(async () => {
    const nextFacing = facingRef.current === "environment" ? "user" : "environment";
    facingRef.current = nextFacing;
    setFacing(nextFacing);
    await startCamera(nextFacing);
  }, [startCamera]);

  const capture = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `valleys-darley-ar-${Date.now()}.jpg`;
      link.click();
      URL.revokeObjectURL(url);
    }, "image/jpeg", 0.94);
  }, []);

  useEffect(() => () => {
    stopCamera();
    detectorRef.current?.close();
  }, [stopCamera]);

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-[#dededb] text-white">
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className={`h-full w-full transition-opacity duration-700 ${state === "live" ? "opacity-100" : "opacity-0"}`} />

      {state !== "live" && (
        <div className="absolute inset-0 overflow-hidden bg-[#e7e7e4] text-[#151515]">
          <div className="absolute left-1/2 top-[43%] h-56 w-80 -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-[48%] border-[26px] border-[#c4c5c6] opacity-70 shadow-[inset_10px_8px_20px_white,inset_-12px_-10px_24px_rgba(0,0,0,.22),0_35px_55px_rgba(0,0,0,.18)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_0,transparent_15%,rgba(231,231,228,.6)_45%,#e7e7e4_72%)]" />
          <div className="relative flex h-full flex-col px-5 pb-8 pt-5 safe-area">
            <div className="flex items-center justify-between">
              <Link href="/" className="rounded-full bg-white/70 px-4 py-2 text-xs font-bold tracking-tight backdrop-blur">Valley&apos;s Darley</Link>
              <span className="rounded-full border border-black/15 px-3 py-2 text-[10px] uppercase tracking-[0.22em]">AR atelier</span>
            </div>
            <div className="mx-auto my-auto max-w-sm text-center">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-black/45">Virtual try-on</p>
              <h1 className="text-5xl font-semibold leading-[0.9] tracking-[-0.065em]">Your hand.<br /><span className="font-serif font-normal italic text-black/55">Our craft.</span></h1>
              <p className="mx-auto mt-6 max-w-xs text-sm leading-6 text-black/55">หันกล้องไปที่หลังมือ กางนิ้วเล็กน้อย แล้วระบบจะลองสวมแหวนให้คุณแบบเรียลไทม์</p>
              {error && <p role="alert" className="mt-5 rounded-2xl bg-red-50/90 p-4 text-xs leading-5 text-red-700">{error}</p>}
            </div>
            <div className="mx-auto w-full max-w-sm">
              <button
                type="button"
                disabled={state === "loading"}
                onClick={() => startCamera()}
                className="flex min-h-16 w-full items-center justify-center gap-3 rounded-full bg-black px-8 text-sm font-medium text-white disabled:opacity-60"
              >
                {state === "loading" ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />กำลังเตรียม AR…</> : <>เปิดกล้องเพื่อเริ่มลอง <span aria-hidden="true">↗</span></>}
              </button>
              <p className="mt-3 text-center text-[10px] leading-4 text-black/40">ภาพจากกล้องประมวลผลบนอุปกรณ์ของคุณและไม่ถูกอัปโหลด</p>
            </div>
          </div>
        </div>
      )}

      {state === "live" && (
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 pb-6 text-white [text-shadow:0_1px_12px_rgba(0,0,0,.45)]">
          <div className="flex items-start justify-between">
            <Link href="/" className="pointer-events-auto rounded-full bg-black/35 px-4 py-2 text-xs font-bold backdrop-blur-md">Valley&apos;s Darley</Link>
            <button type="button" onClick={switchCamera} aria-label="สลับกล้อง" className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full bg-black/35 text-xl backdrop-blur-md">↻</button>
          </div>

          <div className="self-center rounded-full bg-black/30 px-4 py-2 text-[11px] font-medium backdrop-blur-md">
            <span className={`mr-2 inline-block h-2 w-2 rounded-full ${handFound ? "bg-emerald-400" : "bg-amber-300 animate-pulse"}`} />
            {handFound ? "พบมือแล้ว—ขยับเพื่อดูทุกมุม" : "วางหลังมือให้อยู่กลางภาพ"}
          </div>

          <div className="pointer-events-auto mx-auto w-full max-w-md rounded-[28px] border border-white/20 bg-black/35 p-3 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <div className="flex flex-1 gap-2">
                {ringStyles.map((ringStyle, index) => (
                  <button
                    type="button"
                    key={ringStyle.id}
                    onClick={() => setStyleIndex(index)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-full px-2 py-3 text-[10px] font-medium transition ${styleIndex === index ? "bg-white text-black [text-shadow:none]" : "bg-white/10"}`}
                  >
                    <span className="h-3 w-3 rounded-full border border-white/50" style={{ background: ringStyle.color }} />
                    {ringStyle.name}
                  </button>
                ))}
              </div>
              <button type="button" onClick={capture} aria-label="ถ่ายภาพ" className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-white bg-white/20">
                <span className="h-8 w-8 rounded-full bg-white" />
              </button>
            </div>
            <label className="mt-3 flex items-center gap-3 px-2 pb-1 text-[10px] uppercase tracking-[0.15em]">
              Size
              <input className="accent-white flex-1" type="range" min="0.75" max="1.3" step="0.05" value={ringSize} onChange={(event) => setRingSize(Number(event.target.value))} />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
