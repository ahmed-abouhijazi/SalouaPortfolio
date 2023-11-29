import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

const gltfContainer = document.getElementById('gltfContainer');
let  mixer, clock;

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Instantiate a new renderer and set its size
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
//renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setSize(540, 650); 

// Add the renderer to the DOM
document.getElementById("gltfContainer").appendChild(renderer.domElement);

// Keep the 3D object on a global variable so we can access it later
let object;

// OrbitControls allow the camera to move around the scene
let controls;

// Set which object to render
let objToRender = 'gear';

// Instantiate a loader for the .gltf file
const loader = new GLTFLoader();

// Load the file
loader.load(
    `models/${objToRender}/scene.gltf`,
    function (gltf) {
        if (object) {
            object.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    child.material.dispose();
                }
            });
            scene.remove(object);
        }

        object = gltf.scene;
        object.scale.set(1.2,0.6,0.7);
        

        // Set initial position, rotation, or other properties if needed
        object.position.set(0.5, 0.5, 0.2);

        scene.add(object);

        // Check if the model has animations
        if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(object);
            mixer.clipAction(gltf.animations[0]).play(); // Play the first animation
        }
    },
    function (xhr) {
        // While it is loading, log the progress
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        // If there is an error, log it
        console.error(error);
    }
);

// Add lights to the scene, so we can actually see the 3D model
const topLight = new THREE.DirectionalLight(0xffffff, 1); // (color, intensity)
topLight.position.set(500, 500, 500) // top-left-ish
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, 1);
scene.add(ambientLight);

// OrbitControls setup
controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false; // Disable zoom
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;

// Add animation loop
const animate = () => {
    requestAnimationFrame(animate);

    if (mixer) {
        const delta = clock.getDelta();
        mixer.update(delta);
    }

    controls.update();
    renderer.render(scene, camera);
};


clock = new THREE.Clock();
// Initial call to the animate function
animate();
