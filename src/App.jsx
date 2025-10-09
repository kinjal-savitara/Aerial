import React, {    useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { BackSide, RepeatWrapping, TextureLoader } from "three";
import { GradientTexture, OrbitControls } from "@react-three/drei";

// Flying sphere intro animation
function FlyInSphere({ panoUrl, onFinished }) {
  const mesh = useRef();
  const { camera } = useThree();
  const [progress, setProgress] = useState(0);
  const texture = useLoader(TextureLoader, panoUrl);

  // ✅ Flip horizontally from the very beginning
  React.useEffect(() => {
    texture.wrapS = RepeatWrapping;
    texture.repeat.x = -1;   // mirror horizontally
    texture.offset.x = 1;    // keep seam aligned
    texture.needsUpdate = true;
  }, [texture]);

  useFrame(() => {
    if (progress < 1) {
      const rawT = progress + 0.0025;
      const t = Math.min(rawT, 1);
      setProgress(t);

      const ease = 1 - Math.pow(1 - t, 3);

      if (mesh.current) mesh.current.rotation.y += 0.005;

      const startZ = 250, endZ = 2.5;
      camera.position.z = startZ + (endZ - startZ) * ease;

      const startFov = 140, endFov = 75;
      camera.fov = startFov + (endFov - startFov) * ease;
      camera.updateProjectionMatrix();

      if (t >= 1 && onFinished) onFinished();
    }
  });
  return (
    <mesh ref={mesh} rotation={[0, Math.PI, 0]}>
      <sphereGeometry args={[100, 64, 64]} />
      <meshBasicMaterial map={texture} side={BackSide} />
    </mesh>
  );
}

function BackgroundGradient3D() {
  const { camera } = useThree();
  const group = useRef();

  // Make the gradient plane stick to and face the camera
  useFrame(() => {
    if (!group.current) return;
    group.current.position.copy(camera.position);
    group.current.quaternion.copy(camera.quaternion);
  });

  return (
    <group ref={group}>
      <mesh
        renderOrder={-100}
        position={[0, 0, -1]}      // just behind the camera
        frustumCulled={false}
      >
        <planeGeometry args={[4000, 4000]} />
        <meshBasicMaterial depthTest={false} depthWrite={false} toneMapped={false}>
          {/* realistic sky-ish gradient */}
          <GradientTexture
            stops={[0, 0.4, 1]}        // 0..1
            colors={["#0b1e3a", "#3a6ea5", "#9fd0ff"]}
            size={1024}
          />
        </meshBasicMaterial>
      </mesh>
    </group>
  );
}

function FovZoom({ min = 25, max = 90, step = 0.9 }) {
  const { camera, gl } = useThree();
  React.useEffect(() => {
    const onWheel = (e) => {
      // wheel up = zoom in (smaller FOV), wheel down = zoom out (bigger FOV)
      const zoomIn = e.deltaY < 0;
      const next = zoomIn ? camera.fov * step : camera.fov / step;
      camera.fov = Math.max(min, Math.min(max, next));
      camera.updateProjectionMatrix();
    };
    gl.domElement.addEventListener("wheel", onWheel, { passive: true });
    return () => gl.domElement.removeEventListener("wheel", onWheel);
  }, [camera, gl, min, max, step]);
  return null;
}


// Main App
export default function App() {
  const [showFull, setShowFull] = useState(false);
  const panoUrl = "/assets/my360.jpg"; // ✅ make sure image is in /public/assets/
  const controlsRef = React.useRef(null);
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        overflow: "hidden",
        backgroundColor: "#87CEEB", // light sky blue color
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 100 }}
      >
        {/* <OrbitControls enabled={showFull}  ref={controlsRef} enableZoom={true} enablePan={false} /> */}
        <OrbitControls
          ref={controlsRef}
          enabled={true}          // or tie to your state
          enablePan={false}
          enableZoom={false}      // 👈 turn off dolly-zoom
        />
        <BackgroundGradient3D />
        <FovZoom min={20} max={90} step={0.9} />
        <FlyInSphere panoUrl={panoUrl} onFinished={() => setShowFull(true)} />

      </Canvas>
    </div>
  );
}