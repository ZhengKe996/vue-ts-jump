<template>
  <div
    ref="fatherBox"
    class="bg-slate-800 rounded-xl h-screen md:flex md:p-0"
  ></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useWindowSize } from "@vueuse/core";
import {
  Scene,
  PerspectiveCamera,
  BoxGeometry,
  DirectionalLight,
  WebGL1Renderer,
  MeshLambertMaterial,
  Mesh,
} from "three";
const fatherBox = ref<HTMLElement>();
const x = ref<number>(2);
const { width, height } = useWindowSize();

const scene = new Scene();
const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  1000
);

const geometry = new BoxGeometry(4, 2, 4);
const material = new MeshLambertMaterial({ color: 0xbebebe });

const cube = new Mesh(geometry, material);
scene.add(cube);
const directionalLight = new DirectionalLight(0xf5f5f5, 1.1);
directionalLight.position.set(5, 10, 3);

scene.add(directionalLight);
const renderer = new WebGL1Renderer();
renderer.setClearColor(0x282828);
renderer.setSize(width.value, height.value);

const init = () => {
  fatherBox.value?.appendChild(renderer.domElement);
  render();
};

const render = () => {
  x.value -= 0.1;
  camera.position.set(x.value, 3, 15);
  renderer.render(scene, camera);
  if (x.value > -2) requestAnimationFrame(render);
};

onMounted(() => {
  init();
});
</script>
