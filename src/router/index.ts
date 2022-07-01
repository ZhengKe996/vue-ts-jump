import { createRouter, createWebHistory } from "vue-router";
import { isMobileTerminal } from "@/utils/flexible";
import MobileRoutes from "./modules/mobile-routes";
import PCRoutes from "./modules/pc-routes";

const router = createRouter({
  routes: isMobileTerminal.value ? MobileRoutes : PCRoutes,
  history: createWebHistory(),
});

export default router;
