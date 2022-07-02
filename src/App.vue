<script setup lang="ts">
import { onMounted } from "vue";

onMounted(() => {
  document.oncontextmenu = function (e) {
    return false;
  };
});
</script>

<template>
  <router-view />
</template>

<style>
#app {
  width: 100%;
  height: 100%;
}
</style>
