// "use client";
// import * as THREE from "three";
// import { Canvas, useLoader, useThree, useFrame } from "@react-three/fiber";
// import { OrbitControls } from "@react-three/drei";
// import { useEffect, useRef, useState, useMemo } from "react";
// import { OBJLoader } from "three/examples/jsm/Addons.js";

// /** ---------- Cube from single 6x1 panoramic image ---------- */
// function CubeFromSingleImage({ imageUrl }) {
//   const { scene } = useThree();

//   useEffect(() => {
//     const loader = new THREE.TextureLoader();
//     loader.load(imageUrl, (texture) => {
//       const { image } = texture;
//       const faceSize = image.height; // each face is a square
//       const canvas = document.createElement("canvas");
//       const ctx = canvas.getContext("2d");
//       canvas.width = faceSize;
//       canvas.height = faceSize;

//       const faces = [];
//       for (let i = 0; i < 6; i++) {
//         ctx.clearRect(0, 0, faceSize, faceSize);
//         ctx.drawImage(image, -i * faceSize, 0);
//         const faceCanvas = document.createElement("canvas");
//         faceCanvas.width = faceSize;
//         faceCanvas.height = faceSize;
//         const faceCtx = faceCanvas.getContext("2d");
//         faceCtx.drawImage(canvas, 0, 0);
//         const faceTexture = new THREE.CanvasTexture(faceCanvas);
//         faceTexture.colorSpace = THREE.SRGBColorSpace;
//         faces.push(faceTexture);
//       }

//       const order = [0, 1, 2, 3, 4, 5];
//       const materials = order.map(
//         (i) =>
//           new THREE.MeshBasicMaterial({ map: faces[i], side: THREE.BackSide })
//       );

//       // Remove old cube if any
//       const oldCube = scene.getObjectByName("cube360");
//       if (oldCube) scene.remove(oldCube);

//       const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), materials);
//       cube.name = "cube360";
//       scene.add(cube);
//     });
//   }, [imageUrl, scene]);

//   return null;
// }

// /** ---------- Hotspot component ---------- */
// function Hotspot({ position, onClick }) {
//   const meshRef = useRef();

//   useFrame(() => {
//     if (meshRef.current) {
//       meshRef.current.lookAt(0, 0, 0); // always face camera center
//     }
//   });

//   return (
//     <mesh
//       ref={meshRef}
//       position={position}
//       onClick={onClick}
//       onPointerOver={() => (document.body.style.cursor = "pointer")}
//       onPointerOut={() => (document.body.style.cursor = "default")}
//     >
//       <sphereGeometry args={[0.03, 16, 16]} />
//       <meshBasicMaterial color="white" />
//     </mesh>
//   );
// }

// /** ---------- Main Scene ---------- */
// function BuildingStructure() {
//   const obj = useLoader(OBJLoader, "/assets/Test/highpoly.obj");
//   return <primitive object={obj} position={[0, -1, 0]} scale={0.5} />;
// }

// /** ---------- Virtual Tour ---------- */
// export default function CubeViewer() {
//   const [currentPano, setCurrentPano] = useState("/assets/Test/Render_01.png");

//   // Define your hotspots & pano links
//   const hotspots = useMemo(
//     () => ({
//       "/assets/Test/Render_01.png": [
//         { position: [0.5, -0.5, 0], next: "/assets/Test/Render_02.png" },
//         { position: [0, -0.3, -0.5], next: "/assets/Test/Render_35.png" },
//       ],
//       "/assets/Test/Render_02.png": [
//         { position: [-0.5, -0.5, 0], next: "/assets/Test/Render_01.png" },
//       ],
//       "/assets/Test/Render_35.png": [
//         { position: [0, -0.5, 0.5], next: "/assets/Test/Render_01.png" },
//       ],
//     }),
//     []
//   );

//   return (
//     <div style={{ width: "100vw", height: "100vh" }}>
//       <Canvas
//         camera={{ position: [0, 0, 0.01], fov: 70 }}
//         gl={{
//           outputColorSpace: THREE.SRGBColorSpace,
//           toneMapping: THREE.ACESFilmicToneMapping,
//           toneMappingExposure: 0.8,
//         }}
//       >
//         <ambientLight intensity={1} />
//         <CubeFromSingleImage imageUrl={currentPano} />
//         {/* Optional 3D Model */}
//         <BuildingStructure />

//         {/* Add all hotspots for current pano */}
//         {hotspots[currentPano]?.map((h, i) => (
//           <Hotspot
//             key={i}
//             position={h.position}
//             onClick={() => setCurrentPano(h.next)}
//           />
//         ))}

//         <OrbitControls enableZoom={false} />
//       </Canvas>
//     </div>
//   );
// }

// "use client";
// import * as THREE from "three";
// import { Canvas, useThree, useFrame, useLoader } from "@react-three/fiber";
// import { OrbitControls } from "@react-three/drei";
// import { useEffect, useState, useMemo, useRef } from "react";
// import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

// const tourData = {
//   "/assets/Test/Render_01.png": [
//     { position: [0.3, 0, -0.5], next: "/assets/Test/Render_02.png" },
//   ],
//   "/assets/Test/Render_02.png": [
//     { position: [-0.4, 0, 0.5], next: "/assets/Test/Render_03.png" },
//   ],
//   "/assets/Test/Render_03.png": [
//     { position: [0, 0, -0.5], next: "/assets/Test/Render_01.png" },
//   ],
// };

// // --- Helper to build cube from 6x1 PNG
// function CubeFromSingleImage({ imageUrl, fade }) {
//   const { scene } = useThree();
//   const cubeRef = useRef();

//   useEffect(() => {
//     const loader = new THREE.TextureLoader();
//     loader.load(imageUrl, (texture) => {
//       const { image } = texture;
//       const faceSize = image.height;
//       //   const ctx = document.createElement("canvas").getContext("2d");
//       const faces = [];

//       for (let i = 0; i < 6; i++) {
//         const canvas = document.createElement("canvas");
//         canvas.width = faceSize;
//         canvas.height = faceSize;
//         const cctx = canvas.getContext("2d");
//         cctx.drawImage(image, -i * faceSize, 0);
//         const tex = new THREE.CanvasTexture(canvas);
//         tex.colorSpace = THREE.SRGBColorSpace;
//         faces.push(tex);
//       }

//       const materials = faces.map(
//         (t) =>
//           new THREE.MeshBasicMaterial({
//             map: t,
//             side: THREE.BackSide,
//             transparent: true,
//             opacity: fade,
//           })
//       );

//       const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), materials);
//       cubeRef.current = cube;
//       scene.add(cube);
//     });

//     return () => {
//       if (cubeRef.current) scene.remove(cubeRef.current);
//     };
//   }, [imageUrl, scene, fade]);

//   return null;
// }

// // --- Hotspot component
// function Hotspots({ data, onClick }) {
//   return (
//     <>
//       {data.map((h, i) => (
//         <mesh
//           key={i}
//           position={h.position}
//           onClick={() => onClick(h.next)}
//           onPointerOver={() => (document.body.style.cursor = "pointer")}
//           onPointerOut={() => (document.body.style.cursor = "default")}
//         >
//           <sphereGeometry args={[0.03, 16, 16]} />
//           <meshBasicMaterial color="orange" />
//         </mesh>
//       ))}
//     </>
//   );
// }

// // --- OBJ model for context
// function BuildingStructure() {
//   const obj = useLoader(OBJLoader, "/assets/test/highpoly.obj");
//   useEffect(() => {
//     obj.traverse((child) => {
//       if (child.isMesh) {
//         child.material = new THREE.MeshBasicMaterial({
//           color: "white",
//           wireframe: true,
//         });
//       }
//     });
//   }, [obj]);
//   return <primitive object={obj} position={[0, -1, 0]} scale={0.5} />;
// }

// // --- Main tour scene
// function TourScene() {
//   const [current, setCurrent] = useState("/panos/Render_01.png");
//   const [next, setNext] = useState(null);
//   const [fade, setFade] = useState(1);

//   useFrame(() => {
//     if (next) {
//       setFade((f) => {
//         if (f <= 0) {
//           setCurrent(next);
//           setNext(null);
//           return 0;
//         }
//         return f - 0.05;
//       });
//     } else if (fade < 1) {
//       setFade((f) => Math.min(f + 0.05, 1));
//     }
//   });

//   const handleTravel = (to) => {
//     setNext(to);
//   };

//   const hotspots = useMemo(() => tourData[current] || [], [current]);

//   return (
//     <>
//       <CubeFromSingleImage imageUrl={current} fade={fade} />
//       <Hotspots data={hotspots} onClick={handleTravel} />
//       <BuildingStructure />
//       <OrbitControls enableZoom={false} />
//     </>
//   );
// }

// export default function CubeViewer() {
//   return (
//     <div style={{ width: "100vw", height: "100vh" }}>
//       <Canvas
//         camera={{ position: [0, 0, 0.01], fov: 70 }}
//         gl={{
//           outputColorSpace: THREE.SRGBColorSpace,
//           toneMapping: THREE.ACESFilmicToneMapping,
//           toneMappingExposure: 0.8,
//         }}
//       >
//         <ambientLight intensity={1} />
//         <TourScene />
//       </Canvas>
//     </div>
//   );
// }

"use client";
import * as THREE from "three";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef, useState, useMemo } from "react";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

const tourData = {
  "/panos/Render_01.png": [
    { position: [0, -0.2, -0.8], next: "/panos/Render_02.png" },
  ],
  "/panos/Render_02.png": [
    { position: [0.3, -0.2, 0.7], next: "/panos/Render_03.png" },
  ],
  "/panos/Render_03.png": [
    { position: [-0.4, -0.2, 0.5], next: "/panos/Render_01.png" },
  ],
};

function CubeFromSingleImage({ imageUrl }) {
  const { scene } = useThree();
  const cubeRef = useRef();

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (texture) => {
      const { image } = texture;
      const faceSize = image.height;
      const faces = [];

      for (let i = 0; i < 6; i++) {
        const canvas = document.createElement("canvas");
        canvas.width = faceSize;
        canvas.height = faceSize;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, -i * faceSize, 0);
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        faces.push(tex);
      }

      const materials = faces.map(
        (t) =>
          new THREE.MeshBasicMaterial({
            map: t,
            side: THREE.BackSide,
          })
      );

      const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), materials);
      cubeRef.current = cube;
      scene.add(cube);
    });

    return () => {
      if (cubeRef.current) scene.remove(cubeRef.current);
    };
  }, [imageUrl, scene]);

  return null;
}

// 🌀 Hover circle (moves to raycast hit)
function HoverCircle({ position, visible }) {
  const ref = useRef();
  useFrame(() => {
    if (ref.current && visible) {
      ref.current.rotation.x = -Math.PI / 2;
      ref.current.scale.set(0.1, 0.1, 0.1);
    }
  });
  if (!visible) return null;
  return (
    <mesh ref={ref} position={position}>
      <ringGeometry args={[0.03, 0.04, 32]} />
      <meshBasicMaterial color="orange" side={THREE.DoubleSide} />
    </mesh>
  );
}

function BuildingStructure() {
  const obj = useLoader(OBJLoader, "/assets/test/highpoly.obj");
  useEffect(() => {
    obj.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshBasicMaterial({
          color: "white",
          wireframe: true,
        });
      }
    });
  }, [obj]);
  return <primitive object={obj} position={[0, -1, 0]} scale={0.5} />;
}

// 🧭 Main Tour Scene
function TourScene() {
  const { camera, gl, scene } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const mouse = useRef(new THREE.Vector2());
  const [hoverPoint, setHoverPoint] = useState(null);
  const [hoverVisible, setHoverVisible] = useState(false);
  const [current, setCurrent] = useState("/panos/Render_01.png");
  const [target, setTarget] = useState(null);

  const hotspots = useMemo(() => tourData[current] || [], [current]);

  // Detect hover on cube surface
  useEffect(() => {
    function onMouseMove(event) {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function onClick() {
      if (hoverPoint) {
        // Check if hover point is near any hotspot
        for (let h of hotspots) {
          const dist = new THREE.Vector3(...h.position).distanceTo(
            hoverPoint.clone().normalize()
          );
          if (dist < 0.3) {
            setTarget(h.next);
            return;
          }
        }
      }
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
    };
  }, [hoverPoint, hotspots, gl.domElement]);

  // Raycast from mouse to cube
  useFrame(() => {
    const cube = scene.children.find(
      (obj) => obj.isMesh && obj.geometry.type === "BoxGeometry"
    );
    if (!cube) return;

    raycaster.setFromCamera(mouse.current, camera);
    const intersects = raycaster.intersectObject(cube);
    if (intersects.length > 0) {
      const hit = intersects[0].point;
      setHoverPoint(hit);
      setHoverVisible(true);
      document.body.style.cursor = "pointer";
    } else {
      setHoverVisible(false);
      document.body.style.cursor = "default";
    }

    // Camera travel animation
    if (target) {
      camera.position.lerp(new THREE.Vector3(0, 0, 0.01), 0.05); // keep camera centered
      setCurrent(target);
      setTarget(null);
    }
  });

  return (
    <>
      <CubeFromSingleImage imageUrl={current} />
      <HoverCircle position={hoverPoint} visible={hoverVisible} />
      <BuildingStructure />
      <OrbitControls enableZoom={false} />
    </>
  );
}

export default function CubeViewer() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        camera={{ position: [0, 0, 0.01], fov: 70 }}
        gl={{
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.8,
        }}
      >
        <ambientLight intensity={1} />
        <TourScene />
      </Canvas>
    </div>
  );
}
