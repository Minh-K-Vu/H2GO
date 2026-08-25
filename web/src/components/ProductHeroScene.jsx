import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const CYAN = new THREE.Color("#17b9d2");
const AMBER = new THREE.Color("#f59e42");
const GREEN = new THREE.Color("#2caf74");

function createCylinder(radius, length, material) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 48), material);
  mesh.rotation.z = Math.PI / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createDroplet(material) {
  const points = [
    new THREE.Vector3(0, 0.32, 0),
    new THREE.Vector3(0.2, 0.05, 0),
    new THREE.Vector3(0.24, -0.12, 0),
    new THREE.Vector3(0.14, -0.29, 0),
    new THREE.Vector3(0, -0.35, 0),
    new THREE.Vector3(-0.14, -0.29, 0),
    new THREE.Vector3(-0.24, -0.12, 0),
    new THREE.Vector3(-0.2, 0.05, 0),
    new THREE.Vector3(0, 0.32, 0),
  ];
  const curve = new THREE.CatmullRomCurve3(points, true, "catmullrom", 0.35);
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.018, 10, true), material);
}

export default function ProductHeroScene({ phase = 0, paused = false, onReady }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const phaseRef = useRef(phase);
  const pausedRef = useRef(paused);
  const pointerRef = useRef({ x: 0, y: 0 });
  const onReadyRef = useRef(onReady);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch {
      return undefined;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor("#e8edeb", 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0.2, 8.5);

    const ambient = new THREE.HemisphereLight("#ffffff", "#58717a", 1.55);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight("#ffffff", 2.5);
    keyLight.position.set(-4, 6, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -8;
    keyLight.shadow.camera.right = 8;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -6;
    keyLight.shadow.radius = 6;
    keyLight.shadow.blurSamples = 16;
    scene.add(keyLight);

    const edgeLight = new THREE.DirectionalLight("#79dcef", 1.1);
    edgeLight.position.set(6, 2, 5);
    scene.add(edgeLight);

    const wallMaterial = new THREE.MeshStandardMaterial({ color: "#e8edeb", roughness: 0.94 });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(28, 18), wallMaterial);
    wall.position.z = -1.4;
    wall.receiveShadow = true;
    scene.add(wall);

    const seamMaterial = new THREE.MeshBasicMaterial({ color: "#dce3e1", transparent: true, opacity: 0.7 });
    const seam = new THREE.Mesh(new THREE.PlaneGeometry(0.018, 18), seamMaterial);
    seam.position.set(-2.6, 0, -1.35);
    scene.add(seam);

    const product = new THREE.Group();
    scene.add(product);

    const copper = new THREE.MeshStandardMaterial({ color: "#aa5c2f", metalness: 0.88, roughness: 0.25 });
    const brass = new THREE.MeshStandardMaterial({ color: "#b88a42", metalness: 0.92, roughness: 0.2 });
    const steel = new THREE.MeshStandardMaterial({ color: "#b8c0c0", metalness: 0.96, roughness: 0.18 });
    const darkSteel = new THREE.MeshStandardMaterial({ color: "#5e686b", metalness: 0.9, roughness: 0.24 });
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: "#edf0ed", metalness: 0.08, roughness: 0.32 });
    const faceMaterial = new THREE.MeshStandardMaterial({ color: "#f7f8f5", metalness: 0.03, roughness: 0.27 });
    const logoMaterial = new THREE.MeshStandardMaterial({
      color: "#87cbd5",
      emissive: "#17b9d2",
      emissiveIntensity: 0.25,
      metalness: 0.2,
      roughness: 0.25,
      toneMapped: false,
    });

    const leftPipe = createCylinder(0.25, 4.8, copper);
    leftPipe.position.x = -3.45;
    product.add(leftPipe);

    const rightPipe = createCylinder(0.25, 4.8, copper);
    rightPipe.position.x = 3.45;
    product.add(rightPipe);

    [-1.42, 1.42].forEach((x) => {
      const brassCollar = createCylinder(0.34, 0.46, brass);
      brassCollar.position.x = x;
      product.add(brassCollar);

      const steelCollar = createCylinder(0.43, 0.58, steel);
      steelCollar.position.x = x < 0 ? x - 0.46 : x + 0.46;
      product.add(steelCollar);

      const ring = createCylinder(0.46, 0.1, darkSteel);
      ring.position.x = x < 0 ? x - 0.77 : x + 0.77;
      product.add(ring);
    });

    const body = new THREE.Mesh(new RoundedBoxGeometry(2.65, 1.82, 0.82, 7, 0.18), bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    product.add(body);

    const face = new THREE.Mesh(new RoundedBoxGeometry(2.48, 1.65, 0.1, 7, 0.15), faceMaterial);
    face.position.z = 0.45;
    face.castShadow = true;
    product.add(face);

    const droplet = createDroplet(logoMaterial);
    droplet.position.set(0, -0.18, 0.525);
    droplet.scale.setScalar(0.72);
    product.add(droplet);

    const ledMaterial = new THREE.MeshStandardMaterial({
      color: CYAN.clone(),
      emissive: CYAN.clone(),
      emissiveIntensity: 3,
      roughness: 0.2,
      toneMapped: false,
    });
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.07, 28, 28), ledMaterial);
    led.position.set(0, 0.38, 0.55);
    product.add(led);

    const pulseMaterial = new THREE.MeshBasicMaterial({
      color: CYAN.clone(),
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const pulse = new THREE.Mesh(new THREE.RingGeometry(0.105, 0.125, 48), pulseMaterial);
    pulse.position.set(0, 0.38, 0.56);
    product.add(pulse);

    const actuator = new THREE.Group();
    actuator.position.y = 1.02;
    product.add(actuator);

    const actuatorBase = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.18, 48), steel);
    actuatorBase.castShadow = true;
    actuator.add(actuatorBase);

    const actuatorBody = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.39, 0.48, 48), steel);
    actuatorBody.position.y = 0.31;
    actuatorBody.castShadow = true;
    actuator.add(actuatorBody);

    const actuatorCap = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.12, 48), darkSteel);
    actuatorCap.position.y = 0.61;
    actuatorCap.castShadow = true;
    actuator.add(actuatorCap);

    const positionMarker = new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.08, 0.08, 3, 0.03), darkSteel);
    positionMarker.position.set(0.27, 0.33, 0.23);
    actuator.add(positionMarker);

    const flowCount = 32;
    const flowPositions = new Float32Array(flowCount * 3);
    const flowGeometry = new THREE.BufferGeometry();
    flowGeometry.setAttribute("position", new THREE.BufferAttribute(flowPositions, 3));
    const flowMaterial = new THREE.PointsMaterial({
      color: CYAN.clone(),
      size: 0.075,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    const flow = new THREE.Points(flowGeometry, flowMaterial);
    flow.position.z = 0.62;
    product.add(flow);

    const timer = new THREE.Timer();
    timer.connect(document);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrame;
    let elapsed = 0;
    let valveProgress = 0;
    let currentFlowSpeed = 0.72;
    let currentFlowOpacity = 0.9;

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      const mobile = width < 768;

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = mobile ? 43 : 34;
      camera.position.z = mobile ? 9.8 : 8.7;
      camera.updateProjectionMatrix();

      product.position.set(mobile ? 0.45 : 2.25, mobile ? 1.65 : 0.35, 0);
      product.scale.setScalar(mobile ? 0.68 : 0.9);
    };

    const onPointerMove = (event) => {
      const rect = container.getBoundingClientRect();
      pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    };

    const onPointerLeave = () => {
      pointerRef.current = { x: 0, y: 0 };
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);
    resize();

    const render = (timestamp) => {
      animationFrame = window.requestAnimationFrame(render);
      timer.update(timestamp);
      const delta = Math.min(timer.getDelta(), 0.05);
      const isPaused = pausedRef.current || reducedMotion;
      if (!isPaused) elapsed += delta;

      const currentPhase = phaseRef.current;
      const targetColor = currentPhase === 1 ? AMBER : currentPhase === 2 ? GREEN : CYAN;
      const targetSpeed = currentPhase === 2 ? 0.04 : currentPhase === 1 ? 1.25 : 0.72;
      const targetOpacity = currentPhase === 2 ? 0.18 : 0.9;
      const targetValve = currentPhase === 2 ? 1 : 0;

      currentFlowSpeed += (targetSpeed - currentFlowSpeed) * 0.045;
      currentFlowOpacity += (targetOpacity - currentFlowOpacity) * 0.045;
      valveProgress += (targetValve - valveProgress) * 0.055;

      ledMaterial.color.lerp(targetColor, 0.06);
      ledMaterial.emissive.lerp(targetColor, 0.06);
      pulseMaterial.color.lerp(targetColor, 0.06);
      flowMaterial.color.lerp(targetColor, 0.06);
      flowMaterial.opacity = currentFlowOpacity;
      actuator.rotation.y = valveProgress * Math.PI * 0.5;

      for (let index = 0; index < flowCount; index += 1) {
        const offset = (index / flowCount) * 10.8;
        const x = ((offset + elapsed * currentFlowSpeed * 2.4) % 10.8) - 5.4;
        flowPositions[index * 3] = x;
        flowPositions[index * 3 + 1] = Math.sin(index * 1.7 + elapsed * 2.1) * 0.018;
        flowPositions[index * 3 + 2] = 0;
      }
      flowGeometry.attributes.position.needsUpdate = true;

      const pulseScale = currentPhase === 1 ? 1 + ((Math.sin(elapsed * 5) + 1) * 0.55) : 1 + ((Math.sin(elapsed * 2.4) + 1) * 0.2);
      pulse.scale.setScalar(pulseScale);
      pulseMaterial.opacity = currentPhase === 2 ? 0.18 : 0.18 + ((Math.sin(elapsed * 3) + 1) * 0.12);

      const pointer = pointerRef.current;
      const targetRotationY = isPaused ? 0 : pointer.x * 0.055 + Math.sin(elapsed * 0.3) * 0.025;
      const targetRotationX = isPaused ? 0 : pointer.y * 0.025;
      product.rotation.y += (targetRotationY - product.rotation.y) * 0.035;
      product.rotation.x += (targetRotationX - product.rotation.x) * 0.035;

      renderer.render(scene, camera);
    };

    renderer.render(scene, camera);
    setReady(true);
    onReadyRef.current?.();
    render();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      timer.dispose();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
        else if (object.material) object.material.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 bg-[#e8edeb]" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className={`h-full w-full transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
        data-product-scene={ready ? "ready" : "loading"}
      />
      {ready ? null : <div className="absolute inset-0 bg-[#e8edeb]" />}
    </div>
  );
}
