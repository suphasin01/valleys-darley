import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type RingFinish = "silver" | "onyx" | "rose";

export type RingPose = {
  x: number;
  y: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
  grabbed: boolean;
};

const finishes: Record<RingFinish, { metal: number; gem: number }> = {
  silver: { metal: 0xe9ecef, gem: 0xf2fdff },
  onyx: { metal: 0x4c5055, gem: 0x090a0c },
  rose: { metal: 0xd99a91, gem: 0xffeee9 },
};

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

export class Ring3DRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  private ring = createRingModel();
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

  render(pose: RingPose) {
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
    this.ring.position.x += (normalizedX * visibleHalfWidth - this.ring.position.x) * 0.28;
    this.ring.position.y += (-normalizedY * visibleHalfHeight - this.ring.position.y) * 0.28;
    this.ring.position.z = 0;
    this.ring.rotation.x += (pose.rotationX - this.ring.rotation.x) * 0.2;
    this.ring.rotation.y += (pose.rotationY - this.ring.rotation.y) * 0.2;
    this.ring.rotation.z += (pose.rotationZ - this.ring.rotation.z) * 0.2;
    const pulse = pose.grabbed ? 1.04 + Math.sin(this.clock.elapsedTime * 7) * 0.015 : 1;
    this.ring.scale.setScalar(pose.scale * pulse);
    this.renderer.render(this.scene, this.camera);
  }

  clear() {
    this.renderer.clear();
  }

  dispose() {
    this.ring.traverse((object) => {
      if (object instanceof THREE.Mesh) object.geometry.dispose();
    });
    (this.ring.userData.metal as THREE.Material).dispose();
    (this.ring.userData.gem as THREE.Material).dispose();
    this.renderer.dispose();
  }
}
