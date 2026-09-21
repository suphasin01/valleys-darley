import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type RingFinish = "silver" | "onyx" | "rose";

export type RingPose = {
  x: number;
  y: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  quaternion?: [number, number, number, number];
  scale: number;
  targetWidth?: number;
  grabbed: boolean;
};

const finishes: Record<RingFinish, { metal: number; gem: number }> = {
  silver: { metal: 0xe9ecef, gem: 0xf2fdff },
  onyx: { metal: 0x4c5055, gem: 0x090a0c },
  rose: { metal: 0xd99a91, gem: 0xffeee9 },
};

function smoothAngle(current: number, target: number, amount: number) {
  let difference = target - current;
  while (difference > Math.PI) difference -= Math.PI * 2;
  while (difference < -Math.PI) difference += Math.PI * 2;
  return current + difference * amount;
}

function createRingModel() {
  const group = new THREE.Group();
  group.rotation.order = "YXZ";

  const metal = new THREE.MeshStandardMaterial({
    color: finishes.silver.metal,
    metalness: 1,
    roughness: 0.14,
    envMapIntensity: 1.9,
  });

  const band = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.16, 32, 160), metal);
  band.castShadow = true;
  group.add(band);

  const setting = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.095, 24, 96), metal);
  setting.scale.set(0.74, 1.05, 1);
  setting.position.set(0, 1.48, 0.13);
  group.add(setting);

  const gallery = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.68, 0.36, 48, 1, true), metal);
  gallery.scale.set(0.76, 1, 1.03);
  gallery.rotation.x = Math.PI / 2;
  gallery.position.set(0, 1.48, 0.02);
  group.add(gallery);

  const gemMaterial = new THREE.MeshPhysicalMaterial({
    color: finishes.silver.gem,
    metalness: 0,
    roughness: 0.04,
    transmission: 0.9,
    thickness: 1.4,
    ior: 2.35,
    reflectivity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: 2.7,
  });

  const gemstone = new THREE.Mesh(new THREE.IcosahedronGeometry(0.73, 2), gemMaterial);
  gemstone.scale.set(0.72, 1.02, 0.42);
  gemstone.position.set(0, 1.48, 0.42);
  gemstone.rotation.z = Math.PI / 10;
  group.add(gemstone);

  const prongGeometry = new THREE.CapsuleGeometry(0.095, 0.3, 8, 16);
  const prongs: Array<[number, number, number]> = [
    [-0.48, 1.05, 0.38],
    [0.48, 1.05, 0.38],
    [-0.48, 1.91, 0.38],
    [0.48, 1.91, 0.38],
  ];
  prongs.forEach(([x, y, z], index) => {
    const prong = new THREE.Mesh(prongGeometry, metal);
    prong.position.set(x, y, z);
    prong.rotation.z = (index % 2 ? -1 : 1) * 0.45;
    group.add(prong);
  });

  const shoulderGeometry = new THREE.SphereGeometry(0.28, 32, 18);
  [-1, 1].forEach((direction) => {
    const shoulder = new THREE.Mesh(shoulderGeometry, metal);
    shoulder.scale.set(1.5, 0.62, 0.75);
    shoulder.position.set(direction * 0.62, 1.08, 0.02);
    shoulder.rotation.z = direction * 0.55;
    group.add(shoulder);
  });

  group.userData.metal = metal;
  group.userData.gem = gemMaterial;
  return group;
}

function createTryOnModel(metal: THREE.MeshStandardMaterial, gemMaterial: THREE.MeshPhysicalMaterial) {
  const group = new THREE.Group();
  group.rotation.order = "YXZ";

  // Only the near half is rendered, so the band appears to wrap around the
  // finger instead of floating across the skin.
  const frontBand = new THREE.Mesh(
    new THREE.TorusGeometry(1.03, 0.13, 28, 96, Math.PI),
    metal,
  );
  frontBand.rotation.z = Math.PI;
  frontBand.scale.y = 0.34;
  frontBand.position.z = 0.08;
  group.add(frontBand);

  const gallery = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.62, 0.3, 48, 1, true), metal);
  gallery.scale.set(0.76, 1, 1);
  gallery.rotation.x = Math.PI / 2;
  gallery.position.z = 0.14;
  group.add(gallery);

  const setting = new THREE.Mesh(new THREE.TorusGeometry(0.63, 0.085, 24, 96), metal);
  setting.scale.set(0.74, 1.02, 1);
  setting.position.z = 0.26;
  group.add(setting);

  const gemstone = new THREE.Mesh(new THREE.IcosahedronGeometry(0.63, 2), gemMaterial);
  gemstone.scale.set(0.72, 1.02, 0.38);
  gemstone.position.z = 0.5;
  gemstone.rotation.z = Math.PI / 10;
  group.add(gemstone);

  const prongGeometry = new THREE.CapsuleGeometry(0.075, 0.22, 7, 14);
  const prongs: Array<[number, number, number, number]> = [
    [-0.4, -0.39, 0.46, 0.42],
    [0.4, -0.39, 0.46, -0.42],
    [-0.4, 0.39, 0.46, -0.42],
    [0.4, 0.39, 0.46, 0.42],
  ];
  prongs.forEach(([x, y, z, rotation]) => {
    const prong = new THREE.Mesh(prongGeometry, metal);
    prong.position.set(x, y, z);
    prong.rotation.z = rotation;
    group.add(prong);
  });

  const shoulderGeometry = new THREE.SphereGeometry(0.22, 28, 16);
  [-1, 1].forEach((direction) => {
    const shoulder = new THREE.Mesh(shoulderGeometry, metal);
    shoulder.scale.set(1.75, 0.52, 0.68);
    shoulder.position.set(direction * 0.63, -0.17, 0.15);
    shoulder.rotation.z = direction * 0.2;
    group.add(shoulder);
  });

  return group;
}

export class Ring3DRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  private ring = createRingModel();
  private tryOnRing = createTryOnModel(
    this.ring.userData.metal as THREE.MeshStandardMaterial,
    this.ring.userData.gem as THREE.MeshPhysicalMaterial,
  );
  private clock = new THREE.Clock();
  private width = 0;
  private height = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.camera.position.set(0, 0, 9);
    this.camera.lookAt(0, 0, 0);
    this.scene.add(this.ring);
    this.scene.add(this.tryOnRing);
    this.tryOnRing.visible = false;

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(-3, 5, 7);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xbcdcff, 1.7);
    fill.position.set(4, -1, 4);
    this.scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffe5dd, 2.1);
    rim.position.set(2, 3, -4);
    this.scene.add(rim);
  }

  setFinish(finish: RingFinish) {
    const palette = finishes[finish];
    const metal = this.ring.userData.metal as THREE.MeshStandardMaterial;
    const gem = this.ring.userData.gem as THREE.MeshPhysicalMaterial;
    metal.color.setHex(palette.metal);
    metal.roughness = finish === "onyx" ? 0.2 : 0.14;
    gem.color.setHex(palette.gem);
    gem.transmission = finish === "onyx" ? 0.28 : 0.9;
    gem.roughness = finish === "onyx" ? 0.12 : 0.04;
  }

  render(pose: RingPose, variant: "inspect" | "try-on" = "inspect") {
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width !== this.width || height !== this.height) {
      this.width = width;
      this.height = height;
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / Math.max(1, height);
      this.camera.updateProjectionMatrix();
    }

    const visibleHalfHeight = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * this.camera.position.z;
    const visibleHalfWidth = visibleHalfHeight * this.camera.aspect;
    const normalizedX = (pose.x / Math.max(1, width)) * 2 - 1;
    const normalizedY = (pose.y / Math.max(1, height)) * 2 - 1;
    const activeRing = variant === "try-on" ? this.tryOnRing : this.ring;
    const activeWasVisible = activeRing.visible;
    this.ring.visible = variant === "inspect";
    this.tryOnRing.visible = variant === "try-on";
    activeRing.position.x += (normalizedX * visibleHalfWidth - activeRing.position.x) * 0.38;
    activeRing.position.y += (-normalizedY * visibleHalfHeight - activeRing.position.y) * 0.38;
    activeRing.position.z = 0;
    if (pose.quaternion) {
      const targetQuaternion = new THREE.Quaternion(...pose.quaternion);
      if (activeRing.quaternion.dot(targetQuaternion) < 0) {
        targetQuaternion.set(
          -targetQuaternion.x,
          -targetQuaternion.y,
          -targetQuaternion.z,
          -targetQuaternion.w,
        );
      }
      if (activeWasVisible) activeRing.quaternion.slerp(targetQuaternion, 0.34);
      else activeRing.quaternion.copy(targetQuaternion);
    } else {
      activeRing.rotation.x = smoothAngle(activeRing.rotation.x, pose.rotationX, 0.28);
      activeRing.rotation.y = smoothAngle(activeRing.rotation.y, pose.rotationY, 0.28);
      activeRing.rotation.z = smoothAngle(activeRing.rotation.z, pose.rotationZ, 0.34);
    }
    const pulse = variant === "inspect" && pose.grabbed ? 1.04 + Math.sin(this.clock.elapsedTime * 7) * 0.015 : 1;
    const targetScale = pose.targetWidth
      ? ((pose.targetWidth / Math.max(1, width)) * visibleHalfWidth * 2) / 2.2
      : pose.scale;
    const smoothedScale = activeWasVisible
      ? activeRing.scale.x + (targetScale * pulse - activeRing.scale.x) * 0.28
      : targetScale * pulse;
    activeRing.scale.setScalar(smoothedScale);
    this.renderer.render(this.scene, this.camera);
  }

  clear() {
    this.renderer.clear();
  }

  dispose() {
    this.ring.traverse((object) => {
      if (object instanceof THREE.Mesh) object.geometry.dispose();
    });
    this.tryOnRing.traverse((object) => {
      if (object instanceof THREE.Mesh) object.geometry.dispose();
    });
    (this.ring.userData.metal as THREE.Material).dispose();
    (this.ring.userData.gem as THREE.Material).dispose();
    this.renderer.dispose();
  }
}
