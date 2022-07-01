import { watch } from "vue";
import type { ColorRepresentation } from "three";
import {
  OrthographicCamera,
  Scene,
  Vector3,
  WebGL1Renderer,
  BoxGeometry,
  MeshLambertMaterial,
  Mesh,
  DirectionalLight,
  AmbientLight,
} from "three";
import { useWindowSize } from "@vueuse/core";

const L: string = "left";
const R: string = "right";
interface GameConfig {
  background: ColorRepresentation;
  ground: number;
  cubeColor: ColorRepresentation;
  cubeWidth: number;
  cubeHeight: number;
  cubeDeep: number;
  jumperColor: ColorRepresentation;
  jumperWidth: number;
  jumperHeight: number;
  jumperDeep: number;
}

const { width, height } = useWindowSize();

class Game {
  config: GameConfig;
  score: number;
  scene: Scene;
  camera: OrthographicCamera;
  renderer: WebGL1Renderer;
  size: { width: number; height: number };
  cameraPros: { current: Vector3; next: Vector3 };
  cubes: any[];
  cubeStat: { nextDir: string };
  jumperStat: { ready: boolean; xSpeed: number; ySpeed: number };
  falledStat: { location: number; distance: number };
  fallingStat: { end: boolean; speed: number };

  constructor() {
    this.config = {
      background: 0x282828,
      ground: -1,
      cubeColor: 0xbebebe,
      cubeWidth: 4,
      cubeHeight: 2,
      cubeDeep: 4,
      jumperColor: 0x232323,
      jumperWidth: 1,
      jumperHeight: 2,
      jumperDeep: 1,
    };
    this.score = 0;
    this.scene = new Scene();
    this.camera = new OrthographicCamera(
      width.value / -50,
      width.value / 50,
      height.value / 50,
      height.value / -50,
      0,
      5000
    );
    this.renderer = new WebGL1Renderer({ antialias: true });
    this.size = { width: width.value, height: height.value };
    this.cameraPros = {
      current: new Vector3(0, 0, 0),
      next: new Vector3(0, 0, 0),
    };
    this.cubes = [];
    this.cubeStat = {
      nextDir: "",
    };

    this.jumperStat = {
      ready: false,
      xSpeed: 0,
      ySpeed: 0,
    };
    this.falledStat = {
      location: -1, // 落在哪 -1指当前块
      distance: 0,
    };
    this.fallingStat = {
      end: false,
      speed: 0.2,
    };
  }

  init(DOM: HTMLElement | undefined) {
    this.setCamera();
    this.setRenderer(DOM);
    this.setLight();
    this.createCube();
    this.createCube();

    watch(
      [width, height],
      () => {
        this.handleWindowResize();
      },
      {
        immediate: true,
        deep: true,
      }
    );
  }

  // 设置相机位置
  private setCamera() {
    this.camera.position.set(100, 100, 100);
    // 镜头对准
    this.camera.lookAt(this.cameraPros.current);
  }

  // 设置 render
  private setRenderer(DOM: HTMLElement | undefined) {
    this.renderer.setSize(this.size.width, this.size.height);
    this.renderer.setClearColor(this.config.background);
    DOM?.appendChild(this.renderer.domElement);
  }

  // 设置灯光
  private setLight() {
    const directionalLight = new DirectionalLight(0xffffff, 1.1);
    directionalLight.position.set(2, 10, 5);
    this.scene.add(directionalLight);
    const light = new AmbientLight(0xffffff, 0.3);
    this.scene.add(light);
  }

  // 渲染 render
  private render() {
    this.renderer.render(this.scene, this.camera);

    console.log(this.cubes);
  }

  // 设置 size
  private setSize() {
    this.size = { width: width.value, height: height.value };
  }

  // 创建 cube
  private createCube() {
    const geometry = new BoxGeometry(
      this.config.cubeWidth,
      this.config.cubeHeight,
      this.config.cubeDeep
    );
    const material = new MeshLambertMaterial({
      color: this.config.cubeColor,
    });
    const cube = new Mesh(geometry, material);

    if (this.cubes.length) {
      cube.position.x = this.cubes[this.cubes.length - 1].position.x;
      cube.position.y = this.cubes[this.cubes.length - 1].position.y;
      cube.position.z = this.cubes[this.cubes.length - 1].position.z;
      this.cubeStat.nextDir = Math.random() > 0.5 ? L : R;
      if (this.cubeStat.nextDir === L) {
        cube.position.x = cube.position.x - Math.round(Math.random() * 4 + 6);
      } else {
        cube.position.z = cube.position.z - Math.round(Math.random() * 4 + 6);
      }
    }
    this.cubes.push(cube);
    this.scene.add(cube);
  }
  // 设置相机与窗口大小
  private handleWindowResize() {
    this.setSize();
    this.camera.left = this.size.width / -50;
    this.camera.right = this.size.width / 50;
    this.camera.top = this.size.height / 50;
    this.camera.bottom = this.size.height / -50;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.size.width, this.size.height);
    this.render();
  }
  private createJumper() {}
  private updateCamera() {}
}

export default Game;
