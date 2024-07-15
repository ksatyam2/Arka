
import * as THREE from './node_modules/three/build/three.module.js';

let scene, camera, renderer, ground, gridHelper;


export function initScene() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); 

   
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 10);
    camera.lookAt(0, 0, 0);

    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 4; 
    scene.add(ground);

    
    const gridSize = 20; 
    const gridDivisions = 10; 
    gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x000000, 0x000000);
    gridHelper.position.y = 0.001; 
    gridHelper.rotation.x = Math.PI / 4; 
    scene.add(gridHelper);

    
    window.addEventListener('resize', onWindowResize, false);

    return { scene, camera, renderer };
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}


export function render() {
    renderer.render(scene, camera);
}
