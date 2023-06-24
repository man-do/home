import * as THREE from 'three';
// import { Resizer } from './resizer';
// import WebGL from 'three/addons/capabilities/WebGL.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight, true);
document.body.appendChild(renderer.domElement);

// const geometry = new THREE.BoxGeometry(1, 1, 1);
const geometry = new THREE.RingGeometry(1, 2, 32);
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff01 });
const material = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animate();

// const resizer = new Resizer(containers, camera, renderer);
// resizer.onResize = () => {
//   this.render();
// };
 // 
// if (WebGL.isWebGLAvailable()) {
//   animate();
// } else {
//   const warning = WebGL.getWebGLErrorMessage();
//   document.getElementById('container').appendChild(warning);
// }