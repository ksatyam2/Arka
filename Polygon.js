
import * as THREE from './node_modules/three/build/three.module.js';

let vertices = [];
let lineMesh = null;
let activeCopy = null;


export function createVertex(point, scene) {
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const geometry = new THREE.CircleGeometry(0.1, 32); 
    const vertex = new THREE.Mesh(geometry, material);
    vertex.position.copy(point);
    vertex.userData.isVertex = true; 
    scene.add(vertex);

    vertices.push(vertex.position.clone());

    updateLineMesh(scene); 

    render(); 
}


function updateLineMesh(scene) {
    if (lineMesh) {
        scene.remove(lineMesh);
    }

    if (vertices.length < 2) return;

    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = [];

    for (let i = 0; i < vertices.length; i++) {
        linePositions.push(vertices[i].x, vertices[i].y, vertices[i].z);
    }

    if (vertices.length > 2) {
        
        linePositions.push(vertices[0].x, vertices[0].y, vertices[0].z);
    }

    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x800080,
        depthTest: true,
        depthWrite: true
    });

    lineMesh = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(lineMesh);
}


export function completePolygon(scene) {
    if (vertices.length >= 3) {
        // Create polygon geometry
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const indices = [];

        vertices.forEach((vertex, index) => {
            positions.push(vertex.x, vertex.y, vertex.z);
            if (index > 0) {
                indices.push(0, index - 1, index); 
            }
        });

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setIndex(new THREE.Uint32BufferAttribute(indices, 1)); 

        
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
        const polygon = new THREE.Mesh(geometry, material);
        polygon.userData.isPolygon = true; 
        scene.add(polygon);

        
        vertices = [];

        render(); n
    } else {
        alert('Please create at least 3 vertices to complete the polygon.');
    }
}


export function startCopyPolygon(scene, camera) {
    const polygons = scene.children.filter(child => child.userData.isPolygon);
    if (polygons.length > 0) {
        const polygon = polygons[polygons.length - 1];  
        const clone = polygon.clone();
        clone.userData.isCopy = true;
        scene.add(clone);
        activeCopy = clone; 

        
        function moveClone(event) {
            if (activeCopy) {
                const mouse = new THREE.Vector2();
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

                const raycaster = new THREE.Raycaster();
                raycaster.setFromCamera(mouse, camera);

                const intersects = raycaster.intersectObjects(scene.children);
                if (intersects.length > 0) {
                    const point = intersects[0].point;
                    activeCopy.position.copy(point);
                }
            }
        }

        
        document.addEventListener('mousemove', moveClone);

        
        function placeClone(event) {
            if (activeCopy && event.button === 0) {  
                const mouse = new THREE.Vector2();
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

                const raycaster = new THREE.Raycaster();
                raycaster.setFromCamera(mouse, camera);

                const intersects = raycaster.intersectObjects(scene.children);
                if (intersects.length > 0) {
                    const point = intersects[0].point;
                    activeCopy.position.copy(point);

                   
                    document.removeEventListener('mousemove', moveClone);
                    document.removeEventListener('click', placeClone);

                    
                    activeCopy.userData.isCopy = false;
                    activeCopy = null;
                }
            }
        }

        
        document.addEventListener('click', placeClone);
    }
}


export function resetScene(scene) {
    
    const objectsToRemove = scene.children.filter(child => child.userData.isPolygon || child.userData.isVertex || child.userData.isCopy);
    objectsToRemove.forEach(object => {
        scene.remove(object);
        if (object.geometry) object.geometry.dispose();
        if (object.material) object.material.dispose();
    });

    vertices = []; 
    if (lineMesh) {
        scene.remove(lineMesh);
        lineMesh.geometry.dispose();
        lineMesh.material.dispose();
        lineMesh = null;
    }
}


