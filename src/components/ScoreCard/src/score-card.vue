<template>
  <div
    class="content block disabled:flex flex-col justify-center items-center w-72 xl:w-96 h-60 xl:h-96 mx-auto my-64 bg-black bg-opacity-40 rounded-xl border-4 border-white border-opacity-5"
  >
    <div
      class="score-container block text-white text-center text-opacity-60 my-4 xl:my-8"
    >
      <p class="title text-2xl xl:text-4xl font-bold">本次得分</p>
      <h1 class="score text-6xl xl:text-8xl font-bold mt-1.5">0</h1>
    </div>
    <button
      class="restart w-[80%] block h-10 xl:h-12 rounded-2xl mx-auto bg-white border-none font-bold text-xl xl:text-2xl cursor-pointer mt-4 xl:mt-8 hover: text-gray-500"
      @click="emits('reStart')"
    >
      重新开始
    </button>
  </div>
</template>

<script setup lang="ts">
const emits = defineEmits(["reStart"]);
</script>
