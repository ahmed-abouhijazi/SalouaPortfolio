import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

const gltfContainer = document.getElementById('gltfContainer');
let mixer, clock;

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, gltfContainer.clientWidth / gltfContainer.clientHeight, 0.1, 1000);
camera.position.z = 5;

// Instantiate a new renderer and set its size
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(gltfContainer.clientWidth, gltfContainer.clientHeight);
document.getElementById("gltfContainer").appendChild(renderer.domElement);

// OrbitControls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;

// Keep the 3D object on a global variable so we can access it later
let object;

// Set which object to render
let objToRender = 'engine';

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
        // Adjust the scale to make it smaller
        object.scale.set(0.04, 0.04, 0.04);

        // Center the object within the container
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.sub(center);

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

window.addEventListener('resize', () => {
    camera.aspect = gltfContainer.clientWidth / gltfContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(gltfContainer.clientWidth, gltfContainer.clientHeight);
    // Dispose of the existing controls
    controls.dispose();
});

// Add lights to the scene, so we can actually see the 3D model
const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 500, 500);
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, 1);
scene.add(ambientLight);

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
