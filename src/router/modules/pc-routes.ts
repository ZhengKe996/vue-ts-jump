import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/main",
  },
  {
    path: "/main",
    name: "main",
    component: () => import("@/views/Main"),
  },
  {
    path: "/game",
    name: "game-page",
    component: () => import("@/views/Game"),
  },
];

export default routes;
