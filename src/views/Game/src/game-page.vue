<template>
  <div
    ref="fatherBox"
    class="bg-slate-800 rounded-xl h-screen md:flex md:p-0"
  ></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import Game from "@/utils/geme";
const fatherBox = ref<HTMLElement>();
const game = new Game();

const init = () => {
  game.init(fatherBox.value);
};

onMounted(() => {
  init();
});
</script>

<style scoped></style>
