import * as THREE from 'three';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
  import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

  const canvas = document.querySelector('.canvas-3d');

  const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas, 
    alpha: true,     
    antialias: true  
  });
  
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const rect = canvas.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  renderer.setPixelRatio(window.devicePixelRatio);


  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, rect.width / rect.height, 0.1, 100);
  camera.position.set(0, 0, 5);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; 
  controls.enableZoom = false;

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight2.position.set(-5, -5, -5);
  scene.add(directionalLight2);

  const loader = new GLTFLoader();
  loader.load('chapeu.glb', (gltf) => { 
      gltf.scene.scale.set(4, 4, 4);
      gltf.scene.traverse((node) => {
        if (node.isMesh) {
            node.material = new THREE.MeshStandardMaterial({
                color: node.material.color, 
                map: node.material.map,     
                roughness: 0.5,             
                metalness: 0.1
            });
        }
    });
    scene.add(gltf.scene);
  });

  function animate() {
    requestAnimationFrame(animate); 
    controls.update(); 
    renderer.render(scene, camera);
  }

  animate();