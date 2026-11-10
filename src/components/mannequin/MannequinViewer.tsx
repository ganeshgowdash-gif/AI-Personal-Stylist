'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Info, 
  Eye, 
  Layers, 
  User,
  ShieldAlert
} from 'lucide-react';
import { WardrobeItem, BodyShape } from '@/types/database';

interface MannequinViewerProps {
  shirt?: WardrobeItem | null;
  pants?: WardrobeItem | null;
  shoes?: WardrobeItem | null;
  bodyShape?: BodyShape;
  onChangeBodyShape?: (shape: BodyShape) => void;
  className?: string;
  autoRotate?: boolean;
}

export const MannequinViewer: React.FC<MannequinViewerProps> = ({
  shirt,
  pants,
  shoes,
  bodyShape = 'medium',
  onChangeBodyShape,
  className = '',
  autoRotate = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const mannequinGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Mesh References for dynamic updates
  const shirtMeshRef = useRef<THREE.Mesh | null>(null);
  const pantsMeshRef = useRef<THREE.Mesh | null>(null);
  const leftShoeMeshRef = useRef<THREE.Mesh | null>(null);
  const rightShoeMeshRef = useRef<THREE.Mesh | null>(null);
  const bodyMeshesRef = useRef<THREE.Mesh[]>([]);

  // State
  const [isRotating, setIsRotating] = useState(autoRotate);
  const [activeView, setActiveView] = useState<'front' | 'side' | 'back'>('front');
  const [isLoadingTextures, setIsLoadingTextures] = useState(false);

  // Texture Loader cache
  const textureLoader = useRef(new THREE.TextureLoader());

  // Proportions based on BodyShape
  const getProportions = (shape: BodyShape) => {
    switch (shape) {
      case 'small':
        return { torsoScaleX: 0.88, torsoScaleZ: 0.88, shoulderWidth: 0.9, limbScale: 0.9 };
      case 'large':
        return { torsoScaleX: 1.16, torsoScaleZ: 1.15, shoulderWidth: 1.14, limbScale: 1.1 };
      case 'medium':
      default:
        return { torsoScaleX: 1.0, torsoScaleZ: 1.0, shoulderWidth: 1.0, limbScale: 1.0 };
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 550;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0c0c0e);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.1, 3.2);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(3, 4, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    // Studio Pedestal Floor
    const pedestalGeo = new THREE.CylinderGeometry(0.85, 0.9, 0.08, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x16161a,
      roughness: 0.8,
      metalness: 0.2,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.04;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // 5. Build Faceless Mannequin Group
    const mannequinGroup = new THREE.Group();
    mannequinGroupRef.current = mannequinGroup;
    scene.add(mannequinGroup);

    buildFacelessMannequin(mannequinGroup, bodyShape);

    // Mouse / Touch Interaction Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !mannequinGroupRef.current) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;

      mannequinGroupRef.current.rotation.y += deltaX * 0.01;
      camera.position.y = Math.max(0.4, Math.min(2.0, camera.position.y - deltaY * 0.005));
      camera.lookAt(0, 1.0, 0);

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(1.8, Math.min(4.8, camera.position.z + e.deltaY * 0.003));
    };

    // Touch support for mobile
    let prevTouchX = 0;
    let prevTouchY = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        prevTouchX = e.touches[0].clientX;
        prevTouchY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && mannequinGroupRef.current) {
        const deltaX = e.touches[0].clientX - prevTouchX;
        mannequinGroupRef.current.rotation.y += deltaX * 0.012;
        prevTouchX = e.touches[0].clientX;
        prevTouchY = e.touches[0].clientY;
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });
    domElement.addEventListener('touchstart', onTouchStart);
    domElement.addEventListener('touchmove', onTouchMove);

    // Animation Loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (mannequinGroupRef.current && isRotating) {
        mannequinGroupRef.current.rotation.y += 0.006;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('touchstart', onTouchStart);
      domElement.removeEventListener('touchmove', onTouchMove);
      renderer.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);

  // Update Body Shape Proportions
  useEffect(() => {
    if (!mannequinGroupRef.current) return;
    const prop = getProportions(bodyShape);

    // Clear and rebuild with new proportions
    while (mannequinGroupRef.current.children.length > 0) {
      mannequinGroupRef.current.remove(mannequinGroupRef.current.children[0]);
    }
    bodyMeshesRef.current = [];
    buildFacelessMannequin(mannequinGroupRef.current, bodyShape);

    // Re-apply garments onto the updated mannequin
    applyGarmentTextures();
  }, [bodyShape]);

  // Update Garments (Shirt, Pants, Shoes) Textures Instantly
  useEffect(() => {
    applyGarmentTextures();
  }, [shirt, pants, shoes]);

  // Re-orient camera on view preset change
  const setView = (view: 'front' | 'side' | 'back') => {
    setActiveView(view);
    if (!mannequinGroupRef.current) return;

    setIsRotating(false);
    if (view === 'front') {
      mannequinGroupRef.current.rotation.y = 0;
    } else if (view === 'side') {
      mannequinGroupRef.current.rotation.y = Math.PI / 2;
    } else if (view === 'back') {
      mannequinGroupRef.current.rotation.y = Math.PI;
    }
  };

  // Build the Faceless Anatomical Mannequin and Garment Meshes
  const buildFacelessMannequin = (group: THREE.Group, shape: BodyShape) => {
    const prop = getProportions(shape);

    // Mannequin Neutral Skin / Material (Faceless Matte Alabaster)
    const mannequinMaterial = new THREE.MeshStandardMaterial({
      color: 0x222226,
      roughness: 0.5,
      metalness: 0.1,
    });

    // 1. Faceless Head (Smooth featureless ellipsoid, zero eyes/nose/mouth/hair)
    const headGeo = new THREE.SphereGeometry(0.12, 32, 32);
    headGeo.scale(0.85, 1.15, 0.95);
    const head = new THREE.Mesh(headGeo, mannequinMaterial);
    head.position.y = 1.82;
    head.castShadow = true;
    group.add(head);

    // 2. Neck
    const neckGeo = new THREE.CylinderGeometry(0.055, 0.065, 0.1, 24);
    const neck = new THREE.Mesh(neckGeo, mannequinMaterial);
    neck.position.y = 1.68;
    group.add(neck);

    // 3. Torso (Chest & Waist)
    const torsoGeo = new THREE.CylinderGeometry(
      0.18 * prop.torsoScaleX,
      0.14 * prop.torsoScaleX,
      0.55,
      32
    );
    torsoGeo.scale(1.0, 1.0, 0.7 * prop.torsoScaleZ);
    const torso = new THREE.Mesh(torsoGeo, mannequinMaterial);
    torso.position.y = 1.35;
    torso.castShadow = true;
    group.add(torso);

    // 4. Arms
    const armMaterial = mannequinMaterial;
    // Left Upper Arm
    const leftArmGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.32, 16);
    const leftArm = new THREE.Mesh(leftArmGeo, armMaterial);
    leftArm.position.set(-0.25 * prop.shoulderWidth, 1.42, 0);
    leftArm.rotation.z = 0.15;
    group.add(leftArm);

    // Left Forearm
    const leftForearmGeo = new THREE.CylinderGeometry(0.038, 0.032, 0.3, 16);
    const leftForearm = new THREE.Mesh(leftForearmGeo, armMaterial);
    leftForearm.position.set(-0.29 * prop.shoulderWidth, 1.15, 0.02);
    leftForearm.rotation.z = 0.1;
    group.add(leftForearm);

    // Right Upper Arm
    const rightArmGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.32, 16);
    const rightArm = new THREE.Mesh(rightArmGeo, armMaterial);
    rightArm.position.set(0.25 * prop.shoulderWidth, 1.42, 0);
    rightArm.rotation.z = -0.15;
    group.add(rightArm);

    // Right Forearm
    const rightForearmGeo = new THREE.CylinderGeometry(0.038, 0.032, 0.3, 16);
    const rightForearm = new THREE.Mesh(rightForearmGeo, armMaterial);
    rightForearm.position.set(0.29 * prop.shoulderWidth, 1.15, 0.02);
    rightForearm.rotation.z = -0.1;
    group.add(rightForearm);

    // 5. Hips / Pelvis
    const hipsGeo = new THREE.CylinderGeometry(
      0.14 * prop.torsoScaleX,
      0.16 * prop.torsoScaleX,
      0.2,
      32
    );
    hipsGeo.scale(1.0, 1.0, 0.75 * prop.torsoScaleZ);
    const hips = new THREE.Mesh(hipsGeo, mannequinMaterial);
    hips.position.y = 1.0;
    group.add(hips);

    // 6. Legs
    // Left Leg
    const leftLegGeo = new THREE.CylinderGeometry(0.075 * prop.limbScale, 0.05 * prop.limbScale, 0.85, 24);
    const leftLeg = new THREE.Mesh(leftLegGeo, mannequinMaterial);
    leftLeg.position.set(-0.11 * prop.torsoScaleX, 0.52, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    // Right Leg
    const rightLegGeo = new THREE.CylinderGeometry(0.075 * prop.limbScale, 0.05 * prop.limbScale, 0.85, 24);
    const rightLeg = new THREE.Mesh(rightLegGeo, mannequinMaterial);
    rightLeg.position.set(0.11 * prop.torsoScaleX, 0.52, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    // =========================================================================
    // GARMENT MESHES (SHIRT, PANTS, SHOES)
    // =========================================================================

    // 1. SHIRT MESH (Conforms over upper torso, shoulders, and chest)
    const shirtGeo = new THREE.CylinderGeometry(
      0.195 * prop.torsoScaleX,
      0.165 * prop.torsoScaleX,
      0.58,
      36
    );
    shirtGeo.scale(1.02, 1.0, 0.74 * prop.torsoScaleZ);

    // Adjust UV coordinates for Front / Back projection
    const uvAttr = shirtGeo.attributes.uv;
    for (let i = 0; i < uvAttr.count; i++) {
      let u = uvAttr.getX(i);
      let v = uvAttr.getY(i);
      // Map cylinder 360 wrap cleanly into front [0.25..0.75]
      uvAttr.setXY(i, u, v);
    }
    shirtGeo.attributes.uv.needsUpdate = true;

    const defaultShirtMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a30,
      roughness: 0.7,
      metalness: 0.1,
    });
    const shirtMesh = new THREE.Mesh(shirtGeo, defaultShirtMat);
    shirtMesh.position.y = 1.34;
    shirtMesh.castShadow = true;
    group.add(shirtMesh);
    shirtMeshRef.current = shirtMesh;

    // 2. PANTS MESH (Conforms over hips and dual legs down to ankles)
    const pantsGroup = new THREE.Group();

    // Upper Pelvis of Pants
    const pantsPelvisGeo = new THREE.CylinderGeometry(
      0.165 * prop.torsoScaleX,
      0.175 * prop.torsoScaleX,
      0.24,
      32
    );
    pantsPelvisGeo.scale(1.02, 1.0, 0.78 * prop.torsoScaleZ);
    const defaultPantsMat = new THREE.MeshStandardMaterial({
      color: 0x202024,
      roughness: 0.75,
      metalness: 0.1,
    });
    const pantsPelvis = new THREE.Mesh(pantsPelvisGeo, defaultPantsMat);
    pantsPelvis.position.y = 0.98;
    pantsGroup.add(pantsPelvis);

    // Left Pant Leg
    const pantLegLeftGeo = new THREE.CylinderGeometry(
      0.082 * prop.limbScale,
      0.058 * prop.limbScale,
      0.82,
      28
    );
    const pantLegLeft = new THREE.Mesh(pantLegLeftGeo, defaultPantsMat);
    pantLegLeft.position.set(-0.11 * prop.torsoScaleX, 0.51, 0);
    pantLegLeft.castShadow = true;
    pantsGroup.add(pantLegLeft);

    // Right Pant Leg
    const pantLegRightGeo = new THREE.CylinderGeometry(
      0.082 * prop.limbScale,
      0.058 * prop.limbScale,
      0.82,
      28
    );
    const pantLegRight = new THREE.Mesh(pantLegRightGeo, defaultPantsMat);
    pantLegRight.position.set(0.11 * prop.torsoScaleX, 0.51, 0);
    pantLegRight.castShadow = true;
    pantsGroup.add(pantLegRight);

    group.add(pantsGroup);
    pantsMeshRef.current = pantsPelvis;

    // 3. SHOES MESH (Left and Right Foot at base)
    const shoeGeo = new THREE.BoxGeometry(0.09 * prop.limbScale, 0.07, 0.22);
    shoeGeo.translate(0, 0, 0.04); // extend forward

    const defaultShoeMat = new THREE.MeshStandardMaterial({
      color: 0x1c1c20,
      roughness: 0.6,
      metalness: 0.2,
    });

    const leftShoe = new THREE.Mesh(shoeGeo, defaultShoeMat);
    leftShoe.position.set(-0.11 * prop.torsoScaleX, 0.04, 0);
    leftShoe.castShadow = true;
    group.add(leftShoe);
    leftShoeMeshRef.current = leftShoe;

    const rightShoe = new THREE.Mesh(shoeGeo.clone(), defaultShoeMat);
    rightShoe.position.set(0.11 * prop.torsoScaleX, 0.04, 0);
    rightShoe.castShadow = true;
    group.add(rightShoe);
    rightShoeMeshRef.current = rightShoe;
  };

  // Map user's actual original photos onto the 3D garment meshes
  const applyGarmentTextures = () => {
    setIsLoadingTextures(true);

    // Apply Shirt Texture
    if (shirtMeshRef.current) {
      if (shirt?.front_photo_url) {
        textureLoader.current.load(
          shirt.front_photo_url,
          (tex) => {
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            tex.colorSpace = THREE.SRGBColorSpace;

            const mat = new THREE.MeshStandardMaterial({
              map: tex,
              color: shirt.primary_color_hex ? new THREE.Color(shirt.primary_color_hex) : 0xffffff,
              roughness: 0.7,
              metalness: 0.05,
            });
            if (shirtMeshRef.current) {
              shirtMeshRef.current.material = mat;
            }
          },
          undefined,
          () => {
            // Fallback to primary color
            if (shirtMeshRef.current) {
              shirtMeshRef.current.material = new THREE.MeshStandardMaterial({
                color: shirt.primary_color_hex || 0x3b82f6,
                roughness: 0.7,
              });
            }
          }
        );
      } else {
        // Empty / No Shirt
        shirtMeshRef.current.material = new THREE.MeshStandardMaterial({
          color: 0x222226,
          roughness: 0.8,
        });
      }
    }

    // Apply Pants Texture
    if (pantsMeshRef.current && pantsMeshRef.current.parent) {
      const pantsColor = pants?.primary_color_hex ? new THREE.Color(pants.primary_color_hex) : 0x202024;

      if (pants?.front_photo_url) {
        textureLoader.current.load(
          pants.front_photo_url,
          (tex) => {
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(1, 2);
            tex.colorSpace = THREE.SRGBColorSpace;

            const pantsMat = new THREE.MeshStandardMaterial({
              map: tex,
              color: pantsColor,
              roughness: 0.75,
              metalness: 0.1,
            });

            // Apply to all children of pants group
            pantsMeshRef.current?.parent?.children.forEach((child) => {
              if (child instanceof THREE.Mesh) {
                child.material = pantsMat;
              }
            });
          },
          undefined,
          () => {
            const fallbackMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.75 });
            pantsMeshRef.current?.parent?.children.forEach((c) => {
              if (c instanceof THREE.Mesh) c.material = fallbackMat;
            });
          }
        );
      } else {
        const emptyMat = new THREE.MeshStandardMaterial({ color: 0x1e1e22, roughness: 0.8 });
        pantsMeshRef.current.parent.children.forEach((c) => {
          if (c instanceof THREE.Mesh) c.material = emptyMat;
        });
      }
    }

    // Apply Shoes Texture & Color
    const shoeColor = shoes?.primary_color_hex ? new THREE.Color(shoes.primary_color_hex) : 0x1c1c20;

    const shoePhoto = shoes?.side_photo_url || shoes?.front_photo_url;
    if (shoePhoto) {
      textureLoader.current.load(
        shoePhoto,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          const shoeMat = new THREE.MeshStandardMaterial({
            map: tex,
            color: shoeColor,
            roughness: 0.6,
            metalness: 0.2,
          });
          if (leftShoeMeshRef.current) leftShoeMeshRef.current.material = shoeMat;
          if (rightShoeMeshRef.current) rightShoeMeshRef.current.material = shoeMat;
        },
        undefined,
        () => {
          const fallback = new THREE.MeshStandardMaterial({ color: shoeColor, roughness: 0.6 });
          if (leftShoeMeshRef.current) leftShoeMeshRef.current.material = fallback;
          if (rightShoeMeshRef.current) rightShoeMeshRef.current.material = fallback;
        }
      );
    } else {
      const defaultShoeMat = new THREE.MeshStandardMaterial({ color: 0x18181c, roughness: 0.8 });
      if (leftShoeMeshRef.current) leftShoeMeshRef.current.material = defaultShoeMat;
      if (rightShoeMeshRef.current) rightShoeMeshRef.current.material = defaultShoeMat;
    }

    setIsLoadingTextures(false);
  };

  return (
    <div className={`relative flex flex-col items-center justify-between overflow-hidden rounded-3xl glass-card border border-white/[0.08] ${className}`}>
      {/* Top Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
        {/* Preset Angle Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10">
          {(['front', 'side', 'back'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setView(view)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                activeView === view
                  ? 'bg-white text-black font-semibold'
                  : 'text-luxury-400 hover:text-white'
              }`}
            >
              {view}
            </button>
          ))}
        </div>

        {/* Body Shape Selector (Small, Medium, Large) */}
        {onChangeBodyShape && (
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10">
            <span className="text-[10px] font-mono text-luxury-500 uppercase px-2">Build:</span>
            {(['small', 'medium', 'large'] as const).map((shape) => (
              <button
                key={shape}
                onClick={() => onChangeBodyShape(shape)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium uppercase transition-all ${
                  bodyShape === shape
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-luxury-400 hover:text-white'
                }`}
              >
                {shape === 'small' ? 'Slim' : shape === 'medium' ? 'Average' : 'Broad'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[480px] cursor-grab active:cursor-grabbing flex items-center justify-center select-none"
      />

      {/* Mandatory Limitation Notice */}
      <div className="absolute bottom-3 left-3 right-3 z-20 p-2.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 flex items-start gap-2 text-[10px] text-luxury-400 leading-relaxed">
        <Info className="w-3.5 h-3.5 text-luxury-300 shrink-0 mt-0.5" />
        <span>
          Preview is built from your uploaded photos. Areas not visible in your photos (back, sides, sleeves) are approximated and may differ from the real garment. This is a visual preview, not a fit or size simulation.
        </span>
      </div>

      {/* Quick Rotation & Reset Pill */}
      <div className="absolute right-4 bottom-16 z-20 flex flex-col gap-2">
        <button
          onClick={() => setIsRotating(!isRotating)}
          title="Toggle 360 Auto-Rotation"
          className={`p-2 rounded-xl backdrop-blur-md border transition-all ${
            isRotating
              ? 'bg-white text-black border-white shadow-md'
              : 'bg-black/60 text-luxury-300 hover:text-white border-white/10'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

