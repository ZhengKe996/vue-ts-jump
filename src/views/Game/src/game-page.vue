<template>
  <div
    ref="fatherBox"
    class="bg-slate-800 rounded-xl w-screen h-screen md:flex md:p-0"
  >
    <div
      class="mask flex-col justify-center items-center fixed w-full h-full bg-black bg-opacity-40"
      v-if="show"
    >
      <score-card @re-start="reStart" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import ScoreCard from "@/components/ScoreCard";
import Game from "@/utils/geme";
import { GameDifficulty } from "@/constants";
const placeList = ["浙江1", "浙江2", "浙江3", "浙江4", "浙江5"];
const fatherBox = ref<HTMLElement>();

const game = new Game(placeList, GameDifficulty[5] ? 5 : 3);
const show = ref(false);
const score = ref(0);
const init = () => {
  game.init(fatherBox.value);
  game.addSuccessFn((result: number) => {
    score.value = result;
  });

  game.addFailedFn(() => {
    show.value = true;
  });
};

onMounted(() => {
  init();
});

const reStart = () => {
  game.restart();
  show.value = false;
};
</script>

<style scoped></style>
