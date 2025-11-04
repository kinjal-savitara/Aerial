"use client";
import * as THREE from "three";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect } from "react";
import { OBJLoader } from "three/examples/jsm/Addons.js";

function CubeFromSingleImage({ imageUrl }) {
  const { scene } = useThree();

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (texture) => {
      const { image } = texture;
      const faceSize = image.height; // each face is square
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = faceSize;
      canvas.height = faceSize;

      const faces = [];

      // Slice 6 square faces from left → right
      for (let i = 0; i < 6; i++) {
        ctx.clearRect(0, 0, faceSize, faceSize);
        ctx.drawImage(image, -i * faceSize, 0);
        const faceCanvas = document.createElement("canvas");
        faceCanvas.width = faceSize;
        faceCanvas.height = faceSize;
        const faceCtx = faceCanvas.getContext("2d");
        faceCtx.drawImage(canvas, 0, 0);
        const faceTexture = new THREE.CanvasTexture(faceCanvas);
        faceTexture.colorSpace = THREE.SRGBColorSpace;
        faces.push(faceTexture);
      }
      const order = [0, 1, 2, 3, 4, 5];
      const materials = order.map(
        (i) =>
          new THREE.MeshBasicMaterial({ map: faces[i], side: THREE.BackSide })
      );

      // Build cube with those faces
      //   const materials = faces.map(
      //     (t) => new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide })
      //   );

      const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), materials);
      scene.add(cube);
    });
  }, [imageUrl, scene]);

  return null;
}

function BuildingStructure() {
  const obj = useLoader(OBJLoader, "/assets/test/highpoly.obj");

  obj.traverse((child) => {
    if (child.isMesh) console.log("child.name", child.name);
  });

  return <primitive object={obj} position={[0, -1, 0]} scale={0.5} />;
}

export default function PanoramaViewer() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        camera={{ position: [0, 0, 0.01], fov: 70 }}
        gl={{
          outputColorSpace: THREE.SRGBColorSpace, // ✅ use correct output color space
          toneMapping: THREE.ACESFilmicToneMapping, // ✅ filmic tone mapping (Biganto-like)
          toneMappingExposure: 0.8, // ✅ slightly darker for realistic look
        }}
      >
        <ambientLight intensity={1} />
        <CubeFromSingleImage imageUrl="/panos/Render_01.png" />
        <BuildingStructure />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
