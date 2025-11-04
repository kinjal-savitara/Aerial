import React, { useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { BackSide, RepeatWrapping, TextureLoader } from "three";
import { OrbitControls } from "@react-three/drei";
import PanoramaViewer from "./components/PanoramaViewer";

// Flying sphere intro animation
function FlyInSphere({ panoUrl, onFinished }) {
  const mesh = useRef();
  const { camera } = useThree();
  const [progress, setProgress] = useState(0);
  const texture = useLoader(TextureLoader, panoUrl);

  // // ✅ Flip horizontally from the very beginning
  React.useEffect(() => {
    texture.wrapS = RepeatWrapping;
    texture.repeat.x = -1; // mirror horizontally
    texture.offset.x = 1; // keep seam aligned
    texture.needsUpdate = true;
  }, [texture]);

  useFrame(() => {
    if (progress < 1) {
      const rawT = progress + 0.003;
      const t = Math.min(rawT, 1);
      setProgress(t);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      if (mesh.current) mesh.current.rotation.y += 0.005;
      const startY = 180,
        endY = 0;
      camera.position.y = startY + (endY - startY) * ease;
      const startZ = 0,
        endZ = 10;
      camera.position.z = startZ + (endZ - startZ) * ease;
      camera.position.x = startZ + (endZ - startZ) * ease;
      const startFov = 150,
        endFov = 75;
      camera.fov = startFov + (endFov - startFov) * ease;
      camera.updateProjectionMatrix();
      if (t >= 1 && onFinished) onFinished();
    }
  });
  return (
    <mesh ref={mesh} rotation={[0, Math.PI, 0]}>
      <sphereGeometry args={[200, 64, 64]} />
      <meshBasicMaterial map={texture} side={BackSide} />
    </mesh>
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

// ----------- Loader Overlay -----------
function FullscreenSpinner() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#031750", // navy blue brand tone
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: -1,
        flexDirection: "column",
        transition: "opacity 0.8s ease",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          border: "6px solid rgba(255,255,255,0.3)",
          borderTop: "6px solid white",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <p
        style={{
          marginTop: 16,
          fontFamily: "Poppins, sans-serif",
          fontSize: 16,
        }}
      >
        Loading scene…
      </p>
    </div>
  );
}

// Main App
export default function App() {
  const panoUrl = "/assets/my360.jpg"; // ✅ make sure image is in /public/assets/
  const controlsRef = React.useRef(null);
  const [showLoader, setShowLoader] = React.useState(true);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        overflow: "hidden",
      }}
    >
      <PanoramaViewer />
    </div>
    // <div
    //   style={{
    //     width: "100vw",
    //     height: "100vh",
    //     margin: 0,
    //     overflow: "hidden",
    //   }}
    // >
    //   {showLoader && <FullscreenSpinner />}
    //   <Canvas camera={{ position: [0, 180, 0], fov: 150 }}>
    //     <OrbitControls
    //       ref={controlsRef}
    //       enabled={true} // or tie to your state
    //       enablePan={false}
    //       enableZoom={false} // 👈 turn off dolly-zoom
    //     />
    //     <FovZoom min={20} max={90} step={0.9} />
    //     <FlyInSphere
    //       panoUrl={panoUrl}
    //       onFinished={() => {
    //         setShowLoader(false);
    //       }}
    //     />
    //   </Canvas>
    // </div>
  );
}
