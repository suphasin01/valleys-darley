"use client";

import Link from "next/link";
import NextImage from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Matrix4, Quaternion, Vector3 } from "three";
import { Ring3DRenderer, type RingFinish, type RingPose } from "./ring3d";

type CameraFacing = "environment" | "user";
type ExperienceState = "intro" | "loading" | "live" | "error";
type ARMode = "try-on" | "inspect";
type GestureState = "searching" | "ready" | "grabbed";
type TryOnFinger = "index" | "middle" | "ring" | "pinky";

type Point = { x: number; y: number; z?: number };
type InspectTransform = {
  x: number;
  y: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  rotation: number;
  flipScale: number;
  grabbed: boolean;
  initialized: boolean;
  frontSign: number;
  grabYaw: number;
  grabPitch: number;
  grabRoll: number;
};

const ringStyles = [
  { id: "silver", name: "Sterling", color: "#e9ecef", gem: "#e8fbff" },
  { id: "onyx", name: "Onyx", color: "#6e7175", gem: "#18191b" },
  { id: "rose", name: "Rose", color: "#e4aaa1", gem: "#fff2ef" },
];

const fingerOptions: Array<{
  id: TryOnFinger;
  label: string;
  base: number;
  joint: number;
  neighbours: number[];
}> = [
  { id: "index", label: "ชี้", base: 5, joint: 6, neighbours: [9] },
  { id: "middle", label: "กลาง", base: 9, joint: 10, neighbours: [5, 13] },
  { id: "ring", label: "นาง", base: 13, joint: 14, neighbours: [9, 17] },
  { id: "pinky", label: "ก้อย", base: 17, joint: 18, neighbours: [13] },
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
  ringImage: HTMLImageElement | null,
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
  const width = Math.max(56, palmWidth * 0.62 * size);
  const height = width * 1.05;
  const x = base.x * 0.5 + joint.x * 0.5;
  const y = base.y * 0.5 + joint.y * 0.5;
  const fingerAngle = Math.atan2(joint.y - base.y, joint.x - base.x);

  context.save();
  context.translate(x, y);
  context.rotate(fingerAngle - Math.PI / 2);

  if (ringImage?.complete && ringImage.naturalWidth > 0) {
    context.shadowColor = "rgba(0, 0, 0, .28)";
    context.shadowBlur = width * 0.09;
    context.shadowOffsetY = width * 0.04;
    context.filter = style.id === "onyx"
      ? "brightness(.62) contrast(1.3) saturate(.35)"
      : style.id === "rose"
        ? "sepia(.34) saturate(1.55) hue-rotate(315deg) brightness(.98)"
        : "none";
    context.drawImage(ringImage, -width / 2, -height / 2, width, height);
    context.restore();
    return;
  }

  context.rotate(Math.PI / 2);
  context.shadowColor = "rgba(0, 0, 0, .34)";
  context.shadowBlur = width * 0.08;
  context.shadowOffsetY = width * 0.04;

  const metal = context.createLinearGradient(-width / 2, 0, width / 2, 0);
  metal.addColorStop(0, "#5f6164");
  metal.addColorStop(0.18, style.color);
  metal.addColorStop(0.45, "#ffffff");
  metal.addColorStop(0.7, style.color);
  metal.addColorStop(1, "#55575a");

  context.beginPath();
  context.ellipse(0, 0, width * 0.22, height * 0.12, 0, 0, Math.PI * 2);
  context.lineWidth = Math.max(5, width * 0.05);
  context.strokeStyle = metal;
  context.stroke();

  const gemSize = width * 0.16;
  context.shadowColor = "rgba(255,255,255,.8)";
  context.shadowBlur = gemSize * 0.7;
  context.beginPath();
  for (let index = 0; index < 8; index += 1) {
    const angle = (Math.PI * 2 * index) / 8 - Math.PI / 8;
    const radius = index % 2 ? gemSize * 0.38 : gemSize * 0.52;
    const gemX = Math.cos(angle) * radius;
    const gemY = -height * 0.15 + Math.sin(angle) * radius;
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

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function drawInspectableRing(
  context: CanvasRenderingContext2D,
  landmarks: Point[] | undefined,
  canvas: HTMLCanvasElement,
  videoWidth: number,
  videoHeight: number,
  scale: number,
  offsetX: number,
  offsetY: number,
  mirrored: boolean,
  style: (typeof ringStyles)[number],
  size: number,
  frontImage: HTMLImageElement | null,
  backImage: HTMLImageElement | null,
  transform: InspectTransform,
) {
  const mapPoint = (point: Point) => ({
    x: offsetX + (mirrored ? 1 - point.x : point.x) * videoWidth * scale,
    y: offsetY + point.y * videoHeight * scale,
  });

  if (!transform.initialized) {
    transform.x = canvas.width / 2;
    transform.y = canvas.height * 0.43;
    transform.initialized = true;
  }

  let pinching = false;
  let showingBack = false;

  if (landmarks) {
    const thumb = mapPoint(landmarks[4]);
    const indexTip = mapPoint(landmarks[8]);
    const wrist = mapPoint(landmarks[0]);
    const middleMcp = mapPoint(landmarks[9]);
    const middleTip = mapPoint(landmarks[12]);
    const indexMcp = mapPoint(landmarks[5]);
    const pinkyMcp = mapPoint(landmarks[17]);
    const palmWidth = Math.max(1, Math.hypot(indexMcp.x - pinkyMcp.x, indexMcp.y - pinkyMcp.y));
    const pinchDistance = Math.hypot(thumb.x - indexTip.x, thumb.y - indexTip.y) / palmWidth;
    pinching = transform.grabbed ? pinchDistance < 0.43 : pinchDistance < 0.3;
    transform.grabbed = pinching;

    if (pinching) {
      const pinchX = (thumb.x + indexTip.x) / 2;
      const pinchY = (thumb.y + indexTip.y) / 2;
      transform.x += (pinchX - transform.x) * 0.32;
      transform.y += (pinchY - transform.y) * 0.32;

      const targetRotation = Math.atan2(middleTip.y - wrist.y, middleTip.x - wrist.x) + Math.PI / 2;
      let rotationDelta = targetRotation - transform.rotation;
      while (rotationDelta > Math.PI) rotationDelta -= Math.PI * 2;
      while (rotationDelta < -Math.PI) rotationDelta += Math.PI * 2;
      transform.rotation += rotationDelta * 0.2;

      const orientedArea = (indexMcp.x - wrist.x) * (pinkyMcp.y - wrist.y)
        - (indexMcp.y - wrist.y) * (pinkyMcp.x - wrist.x);
      const areaSign = Math.sign(orientedArea) || 1;
      if (!transform.frontSign) transform.frontSign = areaSign;
      showingBack = areaSign !== transform.frontSign;

      const palmLength = Math.max(1, Math.hypot(middleMcp.x - wrist.x, middleMcp.y - wrist.y));
      const openness = clamp(palmWidth / (palmLength * 1.25), 0.08, 1);
      const targetFlip = (showingBack ? -1 : 1) * openness;
      transform.flipScale += (targetFlip - transform.flipScale) * 0.22;
    }

    context.save();
    context.strokeStyle = pinching ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.48)";
    context.lineWidth = Math.max(2, canvas.width * 0.0025);
    context.setLineDash(pinching ? [] : [8, 8]);
    context.beginPath();
    context.arc((thumb.x + indexTip.x) / 2, (thumb.y + indexTip.y) / 2, pinching ? 22 : 30, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }

  const baseSize = Math.min(canvas.width * 0.5, canvas.height * 0.34) * size;
  const image = transform.flipScale < 0 ? backImage : frontImage;
  if (image?.complete && image.naturalWidth > 0) {
    context.save();
    context.translate(transform.x, transform.y);
    context.rotate(transform.rotation);
    context.scale(Math.max(0.08, Math.abs(transform.flipScale)), 1);
    context.shadowColor = transform.grabbed ? "rgba(255,255,255,.48)" : "rgba(0,0,0,.34)";
    context.shadowBlur = transform.grabbed ? baseSize * 0.16 : baseSize * 0.1;
    context.shadowOffsetY = baseSize * 0.05;
    context.filter = style.id === "onyx"
      ? "brightness(.62) contrast(1.3) saturate(.35)"
      : style.id === "rose"
        ? "sepia(.34) saturate(1.55) hue-rotate(315deg) brightness(.98)"
        : "none";
    context.drawImage(image, -baseSize / 2, -baseSize * 0.525, baseSize, baseSize * 1.05);
    context.restore();
  }

  return pinching;
}

function smoothAngle(current: number, target: number, amount: number) {
  let difference = target - current;
  while (difference > Math.PI) difference -= Math.PI * 2;
  while (difference < -Math.PI) difference += Math.PI * 2;
  return current + difference * amount;
}

function normalizeAngle(angle: number) {
  let normalized = angle;
  while (normalized > Math.PI) normalized -= Math.PI * 2;
  while (normalized < -Math.PI) normalized += Math.PI * 2;
  return normalized;
}

function getTryOnPose(
  landmarks: Point[],
  worldLandmarks: Point[] | undefined,
  canvas: HTMLCanvasElement,
  videoWidth: number,
  videoHeight: number,
  scale: number,
  offsetX: number,
  offsetY: number,
  mirrored: boolean,
  pixelRatio: number,
  size: number,
  selectedFinger: TryOnFinger,
): RingPose {
  const mapPoint = (point: Point) => ({
    x: (offsetX + (mirrored ? 1 - point.x : point.x) * videoWidth * scale) / pixelRatio,
    y: (offsetY + point.y * videoHeight * scale) / pixelRatio,
  });
  const finger = fingerOptions.find((option) => option.id === selectedFinger) || fingerOptions[2];
  const base = mapPoint(landmarks[finger.base]);
  const joint = mapPoint(landmarks[finger.joint]);
  const neighbourSpacing = finger.neighbours.reduce((total, landmarkIndex) => {
    const neighbour = mapPoint(landmarks[landmarkIndex]);
    return total + Math.hypot(base.x - neighbour.x, base.y - neighbour.y);
  }, 0) / finger.neighbours.length;
  const palmIndex = mapPoint(landmarks[5]);
  const palmPinky = mapPoint(landmarks[17]);
  const palmWidth = Math.hypot(palmIndex.x - palmPinky.x, palmIndex.y - palmPinky.y);
  const centerSpacing = neighbourSpacing * 0.82;
  const boneEstimate = Math.hypot(base.x - joint.x, base.y - joint.y) * 0.68;
  const palmEstimate = palmWidth * (selectedFinger === "pinky" ? 0.19 : 0.23);
  const estimates = [centerSpacing, boneEstimate, palmEstimate].sort((a, b) => a - b);
  const fingerWidth = estimates[1];
  const orientation = worldLandmarks || landmarks;
  const toScenePoint = (point: Point) => new Vector3(
    (mirrored ? -1 : 1) * point.x,
    -point.y,
    -(point.z || 0),
  );
  const ringBase = toScenePoint(orientation[finger.base]);
  const ringJoint = toScenePoint(orientation[finger.joint]);
  const middleKnuckle = toScenePoint(orientation[9]);
  const pinkyKnuckle = toScenePoint(orientation[17]);
  const fingerAxis = ringJoint.sub(ringBase).normalize();
  const handAcross = pinkyKnuckle.sub(middleKnuckle);

  // Project the across-hand direction onto the plane perpendicular to the
  // finger. Together these axes describe the full 3D pose of the ring finger.
  const acrossAxis = handAcross
    .addScaledVector(fingerAxis, -handAcross.dot(fingerAxis))
    .normalize();
  const surfaceNormal = acrossAxis.clone().cross(fingerAxis).normalize();

  // The try-on model represents the visible upper half of the ring, so keep
  // its gemstone on the camera-facing side while retaining its hand tilt.
  if (surfaceNormal.z < 0) {
    acrossAxis.multiplyScalar(-1);
    surfaceNormal.multiplyScalar(-1);
  }

  const ringOrientation = new Quaternion().setFromRotationMatrix(
    new Matrix4().makeBasis(acrossAxis, fingerAxis, surfaceNormal),
  );

  return {
    // Sit on the proximal phalanx rather than over the web between fingers.
    x: base.x * 0.58 + joint.x * 0.42,
    y: base.y * 0.58 + joint.y * 0.42,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    quaternion: [ringOrientation.x, ringOrientation.y, ringOrientation.z, ringOrientation.w],
    scale: 1,
    targetWidth: clamp(fingerWidth * 1.08 * size, 30, canvas.clientWidth * 0.22),
    grabbed: false,
  };
}

function updateInspectPose(
  landmarks: Point[] | undefined,
  worldLandmarks: Point[] | undefined,
  canvas: HTMLCanvasElement,
  videoWidth: number,
  videoHeight: number,
  scale: number,
  offsetX: number,
  offsetY: number,
  mirrored: boolean,
  pixelRatio: number,
  size: number,
  transform: InspectTransform,
): { pose: RingPose; pinching: boolean } {
  const mapPoint = (point: Point) => ({
    x: (offsetX + (mirrored ? 1 - point.x : point.x) * videoWidth * scale) / pixelRatio,
    y: (offsetY + point.y * videoHeight * scale) / pixelRatio,
  });

  if (!transform.initialized) {
    transform.x = canvas.clientWidth / 2;
    transform.y = canvas.clientHeight * 0.43;
    transform.initialized = true;
  }

  let pinching = false;
  if (landmarks) {
    const thumb = mapPoint(landmarks[4]);
    const indexTip = mapPoint(landmarks[8]);
    const wristScreen = mapPoint(landmarks[0]);
    const middleTip = mapPoint(landmarks[12]);
    const indexMcp = mapPoint(landmarks[5]);
    const pinkyMcp = mapPoint(landmarks[17]);
    const palmWidth = Math.max(1, Math.hypot(indexMcp.x - pinkyMcp.x, indexMcp.y - pinkyMcp.y));
    const pinchDistance = Math.hypot(thumb.x - indexTip.x, thumb.y - indexTip.y) / palmWidth;
    const wasGrabbed = transform.grabbed;
    pinching = wasGrabbed ? pinchDistance < 0.44 : pinchDistance < 0.3;

    if (pinching) {
      const pinchX = (thumb.x + indexTip.x) / 2;
      const pinchY = (thumb.y + indexTip.y) / 2;
      transform.x += (pinchX - transform.x) * 0.34;
      transform.y += (pinchY - transform.y) * 0.34;

      const roll = Math.atan2(middleTip.y - wristScreen.y, middleTip.x - wristScreen.x) + Math.PI / 2;
      const orientation = worldLandmarks || landmarks;
      const wrist = orientation[0];
      const index = orientation[5];
      const pinky = orientation[17];
      const ux = index.x - wrist.x;
      const uy = index.y - wrist.y;
      const uz = (index.z || 0) - (wrist.z || 0);
      const vx = pinky.x - wrist.x;
      const vy = pinky.y - wrist.y;
      const vz = (pinky.z || 0) - (wrist.z || 0);
      const nx = uy * vz - uz * vy;
      const ny = uz * vx - ux * vz;
      const nz = ux * vy - uy * vx;
      const yaw = Math.atan2(nx, nz);
      const pitch = Math.atan2(-ny, Math.hypot(nx, nz));
      const displayedYaw = mirrored ? -yaw : yaw;

      if (!wasGrabbed) {
        // A simple pinch always picks the ring up facing the camera. Hand
        // rotation after this moment is applied relative to that front view.
        transform.grabYaw = displayedYaw;
        transform.grabPitch = pitch;
        transform.grabRoll = roll;
        transform.rotationX = 0;
        transform.rotationY = 0;
        transform.rotationZ = 0;
      } else {
        transform.rotationY = smoothAngle(
          transform.rotationY,
          normalizeAngle(displayedYaw - transform.grabYaw),
          0.22,
        );
        transform.rotationX = smoothAngle(
          transform.rotationX,
          normalizeAngle(pitch - transform.grabPitch),
          0.22,
        );
        transform.rotationZ = smoothAngle(
          transform.rotationZ,
          normalizeAngle(roll - transform.grabRoll),
          0.22,
        );
      }
    }
    transform.grabbed = pinching;
  } else {
    transform.grabbed = false;
  }

  if (!pinching) transform.rotationY += 0.006;

  return {
    pinching,
    pose: {
      x: transform.x,
      y: transform.y,
      rotationX: transform.rotationX,
      rotationY: transform.rotationY,
      rotationZ: transform.rotationZ,
      scale: size * 0.78,
      grabbed: pinching,
    },
  };
}

export default function ARExperience() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeCanvasRef = useRef<HTMLCanvasElement>(null);
  const ring3DRef = useRef<Ring3DRenderer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<{ detectForVideo: (video: HTMLVideoElement, timestamp: number) => { landmarks: Point[][]; worldLandmarks?: Point[][] }; close: () => void } | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const latestLandmarksRef = useRef<Point[][]>([]);
  const latestWorldLandmarksRef = useRef<Point[][]>([]);
  const facingRef = useRef<CameraFacing>("environment");
  const styleRef = useRef(ringStyles[0]);
  const ringSizeRef = useRef(1);
  const selectedFingerRef = useRef<TryOnFinger>("ring");
  const modeRef = useRef<ARMode>("try-on");
  const gestureStateRef = useRef<GestureState>("searching");
  const inspectTransformRef = useRef<InspectTransform>({
    x: 0,
    y: 0,
    rotationX: -0.25,
    rotationY: 0.35,
    rotationZ: 0,
    rotation: 0,
    flipScale: 1,
    grabbed: false,
    initialized: false,
    frontSign: 0,
    grabYaw: 0,
    grabPitch: 0,
    grabRoll: 0,
  });
  const [state, setState] = useState<ExperienceState>("intro");
  const [error, setError] = useState("");
  const [facing, setFacing] = useState<CameraFacing>("environment");
  const [styleIndex, setStyleIndex] = useState(0);
  const [ringSize, setRingSize] = useState(1);
  const [selectedFinger, setSelectedFinger] = useState<TryOnFinger>("ring");
  const [handFound, setHandFound] = useState(false);
  const [mode, setMode] = useState<ARMode>("try-on");
  const [gestureState, setGestureState] = useState<GestureState>("searching");

  useEffect(() => {
    facingRef.current = facing;
  }, [facing]);

  useEffect(() => {
    styleRef.current = ringStyles[styleIndex];
    ring3DRef.current?.setFinish(ringStyles[styleIndex].id as RingFinish);
  }, [styleIndex]);

  useEffect(() => {
    ringSizeRef.current = ringSize;
  }, [ringSize]);

  useEffect(() => {
    selectedFingerRef.current = selectedFinger;
  }, [selectedFinger]);

  useEffect(() => {
    modeRef.current = mode;
    inspectTransformRef.current.grabbed = false;
    inspectTransformRef.current.frontSign = 0;
    gestureStateRef.current = handFound ? "ready" : "searching";
    setGestureState(handFound ? "ready" : "searching");
  }, [mode, handFound]);

  useEffect(() => {
    if (state !== "live" || !threeCanvasRef.current) return;
    const renderer = new Ring3DRenderer(threeCanvasRef.current);
    ring3DRef.current = renderer;
    renderer.setFinish(styleRef.current.id as RingFinish);
    return () => {
      renderer.dispose();
      if (ring3DRef.current === renderer) ring3DRef.current = null;
    };
  }, [state]);

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
      const detection = detectorRef.current.detectForVideo(video, performance.now());
      latestLandmarksRef.current = detection.landmarks;
      latestWorldLandmarksRef.current = detection.worldLandmarks || [];
      setHandFound(latestLandmarksRef.current.length > 0);
    }

    const hand = latestLandmarksRef.current[0];
    if (modeRef.current === "try-on" && hand) {
      const pose = getTryOnPose(
        hand,
        latestWorldLandmarksRef.current[0],
        canvas,
        videoWidth,
        videoHeight,
        coverScale,
        offsetX,
        offsetY,
        mirrored,
        pixelRatio,
        ringSizeRef.current,
        selectedFingerRef.current,
      );
      ring3DRef.current?.render(pose, "try-on");
    } else if (modeRef.current === "try-on") {
      ring3DRef.current?.clear();
    } else if (modeRef.current === "inspect") {
      const { pose, pinching } = updateInspectPose(
        hand,
        latestWorldLandmarksRef.current[0],
        canvas,
        videoWidth,
        videoHeight,
        coverScale,
        offsetX,
        offsetY,
        mirrored,
        pixelRatio,
        ringSizeRef.current,
        inspectTransformRef.current,
      );
      ring3DRef.current?.render(pose);
      const nextGestureState: GestureState = !hand ? "searching" : pinching ? "grabbed" : "ready";
      if (nextGestureState !== gestureStateRef.current) {
        gestureStateRef.current = nextGestureState;
        setGestureState(nextGestureState);
      }
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
    const context = canvas.getContext("2d");
    if (context && threeCanvasRef.current) {
      context.drawImage(threeCanvasRef.current, 0, 0, canvas.width, canvas.height);
    }
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
      <canvas ref={threeCanvasRef} className={`pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-300 ${state === "live" ? "opacity-100" : "opacity-0"}`} />

      {state !== "live" && (
        <div className="absolute inset-0 overflow-hidden bg-[#e7e7e4] text-[#151515]">
          <div className="absolute left-1/2 top-[43%] h-[430px] w-[410px] -translate-x-1/2 -translate-y-1/2 rotate-[18deg] opacity-55 drop-shadow-[0_35px_35px_rgba(0,0,0,.22)]">
            <NextImage src="/images/ar-ring-silver-v2.png" alt="" fill priority className="object-contain" sizes="410px" />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_0,transparent_15%,rgba(231,231,228,.6)_45%,#e7e7e4_72%)]" />
          <div className="relative flex h-full flex-col px-5 pb-8 pt-5 safe-area">
            <div className="flex items-center justify-between">
              <Link href="/" className="rounded-full bg-white/70 px-4 py-2 text-xs font-bold tracking-tight backdrop-blur">Valley&apos;s Darley</Link>
              <span className="rounded-full border border-black/15 px-3 py-2 text-[10px] uppercase tracking-[0.22em]">AR atelier</span>
            </div>
            <div className="mx-auto my-auto max-w-sm text-center">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-black/45">Virtual try-on</p>
              <h1 className="text-5xl font-semibold leading-[0.9] tracking-[-0.065em]">Your hand.<br /><span className="font-serif font-normal italic text-black/55">Our craft.</span></h1>
              <p className="mx-auto mt-6 max-w-xs text-sm leading-6 text-black/55">ลองสวมบนมือ หรือจีบนิ้วเพื่อหยิบ ขยับ หมุน และพลิกดูตัวเรือนได้แบบเรียลไทม์</p>
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
          <div>
            <div className="flex items-start justify-between">
              <Link href="/" className="pointer-events-auto rounded-full bg-black/35 px-4 py-2 text-xs font-bold backdrop-blur-md">Valley&apos;s Darley</Link>
              <button type="button" onClick={switchCamera} aria-label="สลับกล้อง" className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full bg-black/35 text-xl backdrop-blur-md">↻</button>
            </div>
            <div className="pointer-events-auto mx-auto mt-3 flex w-fit rounded-full border border-white/20 bg-black/35 p-1 backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setMode("try-on")}
                className={`rounded-full px-5 py-2 text-[11px] font-medium transition ${mode === "try-on" ? "bg-white text-black [text-shadow:none]" : "text-white"}`}
              >
                ลองสวม
              </button>
              <button
                type="button"
                onClick={() => setMode("inspect")}
                className={`rounded-full px-5 py-2 text-[11px] font-medium transition ${mode === "inspect" ? "bg-white text-black [text-shadow:none]" : "text-white"}`}
              >
                หยิบดู
              </button>
            </div>
          </div>

          <div className="self-center rounded-full bg-black/30 px-4 py-2 text-[11px] font-medium backdrop-blur-md">
            <span className={`mr-2 inline-block h-2 w-2 rounded-full ${gestureState === "grabbed" ? "bg-sky-300" : handFound ? "bg-emerald-400" : "bg-amber-300 animate-pulse"}`} />
            {mode === "try-on"
              ? handFound ? "พบมือแล้ว—ขยับเพื่อดูทุกมุม" : "วางหลังมือให้อยู่กลางภาพ"
              : gestureState === "grabbed"
                ? "หยิบแล้ว—ขยับและเอียงมือเพื่อพลิกดู"
                : handFound ? "จีบนิ้วเพื่อหยิบ แล้วหมุนข้อมือดูรอบ 360°" : "ยื่นมือเข้ากล้องเพื่อเริ่มหยิบ"}
          </div>

          <div className="pointer-events-auto mx-auto w-full max-w-md rounded-[28px] border border-white/20 bg-black/35 p-3 shadow-2xl backdrop-blur-xl">
            {mode === "try-on" && (
              <div className="mb-2 flex items-center gap-2 rounded-full bg-black/20 p-1">
                <span className="pl-2 text-[9px] font-medium uppercase tracking-[0.15em] text-white/65">นิ้ว</span>
                <div className="grid flex-1 grid-cols-4 gap-1">
                  {fingerOptions.map((finger) => (
                    <button
                      type="button"
                      key={finger.id}
                      onClick={() => setSelectedFinger(finger.id)}
                      aria-pressed={selectedFinger === finger.id}
                      className={`rounded-full px-2 py-2 text-[10px] font-medium transition ${selectedFinger === finger.id ? "bg-white text-black [text-shadow:none]" : "text-white/80 hover:bg-white/10"}`}
                    >
                      {finger.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
