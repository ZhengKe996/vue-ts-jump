import { watch } from "vue";

import {
  ColorRepresentation,
  OrthographicCamera,
  Scene,
  Vector3,
  WebGL1Renderer,
  BoxGeometry,
  MeshLambertMaterial,
  Mesh,
  DirectionalLight,
  AmbientLight,
  AxesHelper,
  Group,
} from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { TTFLoader } from "three/examples/jsm/loaders/TTFLoader";
import { useWindowSize } from "@vueuse/core";
import { Font } from "three/examples/jsm/loaders/FontLoader";

enum Direction {
  LEFT = "left",
  RIGHT = "right",
}
enum BoxDirection {
  CURRENT_BOX_OK = -1,
  CURRENT_BOX_DROP = -10,
  NEXT_BOX_OK = 1,
  NEXT_BOX_DROP = 10,
  NONE = 0,
}

enum BoxDropDirection {
  LeftBottom = "LeftBottom",
  LeftTop = "LeftTop",
  RightBottom = "RightBottom",
  RightTop = "RightTop",
  None = "None",
}
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
  canvas: HTMLCanvasElement | null = null;
  jumper: Mesh | undefined = undefined;
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

  async init(DOM: HTMLElement | undefined) {
    this.addAxisHelp();
    this.setCamera();
    this.setRenderer(DOM);
    this.setLight();
    await this.createCube();
    await this.createCube();
    this.createJumper();
    this.updateCamera();
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

    for (let item in DOM?.children!) {
      if (DOM?.children.hasOwnProperty(item)) {
        this.canvas = DOM?.children[item] as HTMLCanvasElement;
        break;
      }
    }

    this.canvas?.addEventListener("mousedown", () => {
      this.handleMouseDown();
    });

    this.canvas?.addEventListener("mouseup", () => {
      this.handleMouseUp();
    });

    this.canvas?.addEventListener("touchstart", () => {
      this.handleMouseDown();
    });

    this.canvas?.addEventListener("touchend", () => {
      this.handleMouseUp();
    });
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
  }

  // 设置 size
  private setSize() {
    this.size = { width: width.value, height: height.value };
  }

  // 创建 cube
  private async createCube() {
    const loader = new TTFLoader();
    await loader.load(
      "https://tao-tall.oss-cn-hangzhou.aliyuncs.com/font/AliHYAiHei.ttf",
      (res) => {
        const group = new Group();
        const geometry = new BoxGeometry(
          this.config.cubeWidth,
          this.config.cubeHeight,
          this.config.cubeDeep
        );
        const material = new MeshLambertMaterial({
          color: this.config.cubeColor,
        });
        const cube = new Mesh(geometry, material);

        const font = new TextGeometry(`庆 元`, {
          font: new Font(res), // 字体格式
          size: 1, // 字体大小
          height: 0.01, // 字体深度
          curveSegments: 16, // 曲线控制点数
          bevelEnabled: true, // 斜角
          bevelThickness: 0.05, // 斜角的深度
          bevelSize: 0.05, // 斜角的大小
          bevelSegments: 3, // 斜角段数
        });
        var mat = new MeshLambertMaterial({
          color: "red",
        });
        const mesh = new Mesh(font, mat);
        group.add(cube, mesh);
        if (this.cubes.length) {
          group.position.x = this.cubes[this.cubes.length - 1].position.x;
          group.position.y = this.cubes[this.cubes.length - 1].position.y;
          group.position.z = this.cubes[this.cubes.length - 1].position.z;
          this.cubeStat.nextDir =
            Math.random() > 0.5 ? Direction.LEFT : Direction.RIGHT;
          if (this.cubeStat.nextDir === Direction.LEFT) {
            group.position.x =
              group.position.x - Math.round(Math.random() * 4 + 6);
          } else {
            group.position.z =
              group.position.z - Math.round(Math.random() * 4 + 6);
            mesh.rotation.y = Math.PI / 2;
            mesh.position.set(2, -0.5, 1.25);
          }
        }
        // 第一块渲染
        mesh.rotation.y = Math.PI / 2;
        mesh.position.set(2, -0.5, 1.25);
        this.cubes.push(group);
        if (this.cubes.length > 5) {
          this.scene.remove(this.cubes.shift());
        }
        this.scene.add(group);
        if (this.cubes.length > 1) {
          this.updateCameraPros();
        }
      }
    );
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

  // 添加坐标系
  private addAxisHelp() {
    const axis = new AxesHelper(20);
    this.scene.add(axis);
  }

  // 计算更新镜头的位置
  private updateCameraPros() {
    // 计算 next
    // 当前块和下一个块的中间位置
    const lastIndex = this.cubes.length - 1;

    const pointA = {
      x: this.cubes[lastIndex].position.x,
      z: this.cubes[lastIndex].position.z,
    };
    const pointB = {
      x: this.cubes[lastIndex - 1].position.x,
      z: this.cubes[lastIndex - 1].position.z,
    };
    this.cameraPros.next = new Vector3(
      (pointA.x + pointB.x) / 2,
      0,
      (pointA.z + pointB.z) / 2
    );
  }

  // 更新相机镜头
  private updateCamera() {
    const cur = {
      x: this.cameraPros.current.x,
      y: this.cameraPros.current.y,
      z: this.cameraPros.current.z,
    };
    const next = {
      x: this.cameraPros.next.x,
      y: this.cameraPros.next.y,
      z: this.cameraPros.next.z,
    };

    if (cur.x > next.x || cur.z > next.z) {
      this.cameraPros.current.x -= 0.1;
      this.cameraPros.current.z -= 0.1;
      if (this.cameraPros.current.x - this.cameraPros.next.x < 0.05) {
        this.cameraPros.current.x = this.cameraPros.next.x;
      } else if (this.cameraPros.current.z - this.cameraPros.next.z < 0.05) {
        this.cameraPros.current.z = this.cameraPros.next.z;
      }
    }

    this.camera.lookAt(new Vector3(cur.x, 0, cur.z));
    this.render();
    requestAnimationFrame(() => {
      this.updateCamera();
    });
  }

  // 创建跳块
  private createJumper() {
    const geometry = new BoxGeometry(
      this.config.jumperWidth,
      this.config.jumperHeight,
      this.config.jumperDeep
    );
    const material = new MeshLambertMaterial({
      color: this.config.jumperColor,
    });
    this.jumper = new Mesh(geometry, material);
    this.jumper.position.y = 1;
    geometry.translate(0, 1, 0);
    this.scene.add(this.jumper);
  }

  // 鼠标按下
  private handleMouseDown() {
    if (!this.jumperStat.ready && this.jumper!.scale.y > 0.02) {
      // y 压缩 jumper
      this.jumper!.scale.y -= 0.01;
      console.log(this.jumper!.scale.y);
      // 落地目标点
      this.jumperStat.xSpeed += 0.004;
      this.jumperStat.ySpeed += 0.008;
      this.render();
      requestAnimationFrame(() => {
        this.handleMouseDown();
      });
    }
  }

  // 鼠标弹起
  private handleMouseUp() {
    this.jumperStat.ready = true;
    if (this.jumper!.position.y >= 1) {
      if (this.jumper!.scale.y < 1) {
        this.jumper!.scale.y += 0.1;
      }
      if (this.cubeStat.nextDir === Direction.LEFT) {
        this.jumper!.position.x -= this.jumperStat.xSpeed;
      } else {
        this.jumper!.position.z -= this.jumperStat.xSpeed;
      }
      this.jumper!.position.y += this.jumperStat.ySpeed;
      this.jumperStat.ySpeed -= 0.01;
      this.render();
      requestAnimationFrame(() => {
        this.handleMouseUp();
      });
    } else {
      this.jumperStat.ready = false;
      this.jumperStat.xSpeed = 0;
      this.jumperStat.ySpeed = 0;
      this.jumper!.position.y = 1;
      this.jumper!.scale.y = 1;

      this.checkInCube();

      if (this.falledStat.location == 1) {
        this.score++;
        this.createCube();
        this.updateCamera();
        // if (this.successCallback) {
        //   this.successCallback(this.score);
        // }
      } else {
        this.falling();
      }
    }
  }

  /**
   * 检测落点
   * -1: 落在盒子上 -10: 从当前盒子上掉落
   * 1: 下一个盒子上 10: 从下一个盒子上掉落
   * 0: 没有落在盒子上
   */
  private checkInCube() {
    let distanceCur, distanceNext;

    // 平台与跳块之间的宽
    let should = (this.config.jumperWidth + this.config.cubeWidth) / 2;
    if (this.cubeStat.nextDir === Direction.LEFT) {
      distanceCur = Math.abs(
        this.jumper!.position.x - this.cubes[this.cubes.length - 2].position.x
      );
      distanceNext = Math.abs(
        this.jumper!.position.x - this.cubes[this.cubes.length - 1].position.x
      );
    } else {
      distanceCur = Math.abs(
        this.jumper!.position.z - this.cubes[this.cubes.length - 2].position.z
      );
      distanceNext = Math.abs(
        this.jumper!.position.z - this.cubes[this.cubes.length - 1].position.z
      );
    }

    // 检验跳块落点
    if (distanceCur < should) {
      // 落在当前块
      this.falledStat.distance = distanceCur;
      this.falledStat.location =
        distanceCur < this.config.cubeWidth / 2
          ? BoxDirection.CURRENT_BOX_OK
          : BoxDirection.CURRENT_BOX_DROP;
    } else if (distanceNext < should) {
      // 落在下一块
      this.falledStat.distance = distanceNext;
      this.falledStat.location =
        distanceNext < this.config.cubeWidth / 2
          ? BoxDirection.NEXT_BOX_OK
          : BoxDirection.NEXT_BOX_DROP;
    } else {
      // 没有落在块上
      this.falledStat.location = 0;
    }
  }

  /**
   * 失败下落
   * -10: 当前盒子下落 leftTop rightTop
   * 10: 从下一个盒子下落 leftTop rightTop leftBottom rightBottom
   */
  private falling() {
    if (this.falledStat.location === BoxDirection.NEXT_BOX_DROP) {
      if (this.cubeStat.nextDir === Direction.LEFT) {
        if (
          this.jumper!.position.x > this.cubes[this.cubes.length - 1].position.x
        ) {
          this.fallingRotate(BoxDropDirection.LeftBottom);
        } else {
          this.fallingRotate(BoxDropDirection.LeftTop);
        }
      } else {
        if (
          this.jumper!.position.z > this.cubes[this.cubes.length - 1].position.z
        ) {
          this.fallingRotate(BoxDropDirection.RightBottom);
        } else {
          this.fallingRotate(BoxDropDirection.RightTop);
        }
      }
    } else if (this.falledStat.location == BoxDirection.CURRENT_BOX_DROP) {
      if (this.cubeStat.nextDir === Direction.LEFT) {
        this.fallingRotate(BoxDropDirection.LeftTop);
      } else {
        this.fallingRotate(BoxDropDirection.RightTop);
      }
    } else if (this.falledStat.location == BoxDirection.NONE) {
      this.fallingRotate(BoxDropDirection.None);
    }
  }

  private fallingRotate(value: BoxDropDirection) {
    const offset = this.falledStat.distance - this.config.cubeWidth / 2;

    const rotateAxis = value.includes("Left") ? "z" : "x";

    let rotateAdd = (this.jumper!.rotation as any)[rotateAxis] + 0.1;
    let rotateTo = (this.jumper!.rotation as any)[rotateAxis] < Math.PI / 2;
    let fallingTo = this.config.ground + this.config.jumperWidth / 2 + offset;
    if (value === BoxDropDirection.RightTop) {
      rotateAdd = (this.jumper!.rotation as any)[rotateAxis] - 0.1;
      rotateTo = (this.jumper!.rotation as any)[rotateAxis] > -Math.PI / 2;
    } else if (value === BoxDropDirection.RightBottom) {
      rotateAdd = (this.jumper!.rotation as any)[rotateAxis] + 0.1;
      rotateTo = (this.jumper!.rotation as any)[rotateAxis] < Math.PI / 2;
    } else if (value === BoxDropDirection.LeftBottom) {
      rotateAdd = (this.jumper!.rotation as any)[rotateAxis] - 0.1;
      rotateTo = (this.jumper!.rotation as any)[rotateAxis] > -Math.PI / 2;
    } else if (value === BoxDropDirection.LeftTop) {
      rotateAdd = (this.jumper!.rotation as any)[rotateAxis] + 0.1;
      rotateTo = (this.jumper!.rotation as any)[rotateAxis] < Math.PI / 2;
    } else if (value === BoxDropDirection.None) {
      rotateTo = false;
      fallingTo = this.config.ground;
    } else {
      throw Error("Arguments Error");
    }

    if (!this.fallingStat.end) {
      if (rotateTo) {
        (this.jumper!.rotation as any)[rotateAxis] = rotateAdd;
      } else if (this.jumper!.position.y > fallingTo) {
        this.jumper!.position.y -= 0.2;
      } else {
        this.fallingStat.end = true;
      }
      this.render();
      requestAnimationFrame(() => {
        this.falling();
      });
    } else {
      // if (this.failedCallback) {
      //   this.failedCallback();
      // }
    }
  }
}

export default Game;
