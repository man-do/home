import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import TWEEN from 'three/addons/libs/tween.module.js';
import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js';

//let document.body, stats;
let stats;
const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true,
})
const light = new THREE.HemisphereLight(0xfff7f7, 0x494966, 3);
let color;
let camera, scene, renderer;
let dae;
let kinematics;
let kinematicsTween;
const tweenParameters = {};
const loader = new ColladaLoader();

loader.load('./static/kuka-youbot/kuka-youbot.dae', function (collada) {
  dae = collada.scene;
  dae.traverse(function (child) {
    if (child.isMesh) {
      // model does not have normals
      child.material.flatShading = true;
    }
  });

  dae.scale.x = dae.scale.y = dae.scale.z = window.innerHeight / 50;
  dae.updateMatrix();
  kinematics = collada.kinematics;

  init();
  // initially always scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
  animate();
});

function init() {
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);

  camera.position.set(10, 2, 20)

  scene = new THREE.Scene();
  //const grid = new THREE.GridHelper(20, 20, 0xc1c1c1, 0x8d8d8d);
  //scene.add(grid);
  scene.add(dae);

  scene.add(light);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.useLegacyLights = false;
  document.body.appendChild(renderer.domElement);

  // stats = new Stats();
  // document.body.appendChild(stats.dom);

  setupTween();
  // resize rendere automatically on resize event
  window.addEventListener('resize', onWindowResize);
}

function setupTween() {
  const duration = THREE.MathUtils.randInt(1000, 5000);
  const target = {};
  for (const prop in kinematics.joints) {
    if (kinematics.joints.hasOwnProperty(prop)) {
      if (!kinematics.joints[prop].static) {
        const joint = kinematics.joints[prop];
        const old = tweenParameters[prop];
        const position = old ? old : joint.zeroPosition;
        tweenParameters[prop] = position;
        target[prop] = THREE.MathUtils.randInt(joint.limits.min, joint.limits.max);
      }
    }
  }
  kinematicsTween = new TWEEN.Tween(tweenParameters).to(target, duration).easing(TWEEN.Easing.Quadratic.Out);
  kinematicsTween.onUpdate(function (object) {
    for (const prop in kinematics.joints) {
      if (kinematics.joints.hasOwnProperty(prop)) {
        if (!kinematics.joints[prop].static) {
          kinematics.setJointValue(prop, object[prop]);
        }
      }
    }
  });
  kinematicsTween.start();
  setTimeout(setupTween, duration);
}


/* Liner Interpolation
 * lerp(min, max, ratio)
 * eg,
 * lerp(20, 60, .5)) = 40
 * lerp(-20, 60, .5)) = 20
 * lerp(20, 60, .75)) = 50
 * lerp(-20, -10, .1)) = -.19
 */
function lerp(x, y, a) {
  return (1 - a) * x + a * y
}

// Used to fit the lerps to start and end at specific scrolling percentages
function scalePercent(start, end) {
  return (scrollPercent - start) / (end - start)
}

const animationScripts = []

//add an animation that moves the dae through first 40 percent of scroll
animationScripts.push({
  start: 0,
  end: 40,
  func: () => {
    camera.lookAt(dae.position)
    //camera.position.set(10, 2, 10)
    dae.position.z = lerp(-10, 0, scalePercent(40, 0))
    //console.log(dae.position.z)
  },
})

animationScripts.push({
  start: 0,
  end: 101,
  func: () => {
    //camera.lookAt(dae.position)
    //camera.position.z = 5;
    //dae.position.x = 10;
    //dae.rotation.z = lerp(0, Math.PI, scalePercent(40, 60))
    //console.log(dae.position.y)
    light.intensity = lerp(0, 5, scalePercent(0, 100))
  },
})

//add an animation that rotates the dae between 40-60 percent of scroll
animationScripts.push({
  start: 40,
  end: 100,
  func: () => {
    //camera.lookAt(dae.position)
    //camera.position.set(0, 1, 2)
    dae.rotation.z = lerp(0, Math.PI, scalePercent(40, 100))

    //camera.position.x = 150;
    //console.log(camera.position.x)
    console.log(camera.position.x + " " + camera.position.y + " " + camera.position.z)
    console.log(dae.position.x + " " + dae.position.y + " " + dae.position.z)
  },
})

//add an animation that moves the camera between 60-80 percent of scroll
//animationScripts.push({
//  start: 60,
//  end: 80,
//  func: () => {
//    camera.position.x = lerp(0, 5, scalePercent(60, 80))
//    camera.position.y = lerp(1, 5, scalePercent(60, 80))
//    camera.lookAt(dae.position)
//    //console.log(camera.position.x + " " + camera.position.y)
//  },
//})

//add an animation that auto rotates the dae from 80 percent of scroll
animationScripts.push({
  start: 80,
  end: 101,
  func: () => {
    //auto rotate
    //dae.rotation.x += 0.01
    //dae.rotation.y += 0.01
  },
})

function playScrollAnimations() {
  animationScripts.forEach((a) => {
    if (scrollPercent >= a.start && scrollPercent < a.end) {
      a.func()
    }
  })
}

let scrollPercent = 0

document.body.onscroll = () => {
  //calculate the current scroll progress as a percentage
  scrollPercent =
    ((document.documentElement.scrollTop || document.body.scrollTop) /
      ((document.documentElement.scrollHeight ||
        document.body.scrollHeight) -
        document.documentElement.clientHeight)) *
    100
    ; document.getElementById('scrollProgress').innerText =
      'Scroll Progress : ' + scrollPercent.toFixed(2)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  playScrollAnimations()
  render();
  // stats.update();
  TWEEN.update();
}

function render() {
  const timer = Date.now() * 0.0001;
  //camera.position.x = Math.cos(timer) * 20;
  camera.position.y = 10;
  //camera.position.z = Math.sin(timer) * 20;
  //camera.lookAt(0, 5, 0);
  renderer.render(scene, camera);
}
