import { computed } from "vue";
import { useWindowSize } from "@vueuse/core";
import { PC_DEVICE_WIDTH } from "../constants";

/**
 * @description 判断当前是否为移动设备，判断依据为屏幕的宽度是否大于指定值(1280)
 */
const { width } = useWindowSize();
export const isMobileTerminal = computed(() => {
  return width.value < PC_DEVICE_WIDTH;
});
