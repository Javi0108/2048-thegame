import Sizes from "./Utils/Sizes";
import Time from "./Utils/Time";
import Resources from "./Utils/Resources";
import Camera from "./Camera";
import Renderer from "./Renderer";
import World from "./World/World";
import * as THREE from "three";
import sources from './sources.js'

let instance = null;

export default class Experience {
  constructor(canvas) {
    // Singleton
    if (instance) {
      return instance;
    }
    instance = this;

    window.experience = this;
    this.canvas = canvas;
    this.sizes = new Sizes();
    this.time = new Time();
    this.resources = new Resources(sources);
    this.scene = new THREE.Scene();
    this.loadingManager = new THREE.LoadingManager();
    this.camera = new Camera();
    this.world = new World();
    this.renderer = new Renderer();
    
    this.sizes.on("resize", () => {
      this.resize();
    });

    this.time.on("tick", () => {
      this.update();
    });
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  update() {
    this.camera.update();
    this.world.update();
    this.renderer.update();
  }
}
