<template>
  <div>
    main
    <hr />
    <button @click="handleGameStart">go</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const handleGameStart = () => {
  router.push({ name: "game-page" });
};
</script>
