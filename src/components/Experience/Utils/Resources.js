import EventEmitter from "./EventEmitter.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import * as THREE from "three";

const loadingBar = document.querySelector(".loading-bar");
const loadingNumber = document.querySelector(".loading-number");

export default class Resources extends EventEmitter {
  constructor(sources) {
    super();
    this.sources = sources;
    this.items = {};
    this.toLoad = this.sources.length;
    this.loaded = 0;
    this.setLoaders();
    this.startLoading();
  }

  setLoaders() {
    this.loaders = {};
    // this.loadingManager = new THREE.LoadingManager();
    // this.loadingManager.onLoad = () => {
    //   window.setTimeout(() => {
    //     loadingBar.classList.add("ended");
    //     loadingBar.style.transform = "";
    //     loadingNumber.innerHTML = "";
    //   }, 500);
    // };
    // this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    //   loadingBar.style.transform = `scaleX(${itemsLoaded / itemsTotal})`;
    //   loadingNumber.innerHTML = `${((itemsLoaded / itemsTotal) * 100).toFixed(0)}%`;
    // };
    this.loaders.fontLoader = new FontLoader(this.loadingManager);
    // this.loaders.gltfLoader = new GLTFLoader(this.loadingManager);
    // this.loaders.rgbLoader = new RGBELoader(this.loadingManager);
    this.loaders.textureLoader = new THREE.TextureLoader();
    this.loaders.textureLoader.colorSpace = THREE.SRGBColorSpace
  }

  startLoading() {
    for (const source of this.sources) {
      // if (source.type === "gltfModel") {
      //   this.loaders.gltfLoader.load(source.path, (file) => {
      //     this.sourceLoaded(source, file);
      //   });
      // } else if (source.type === "texture") {
      //   this.loaders.textureLoader.load(source.path, (file) => {
      //     this.sourceLoaded(source, file);
      //   });
      // } else if (source.type === "environmentTexture") {
      //   this.loaders.rgbLoader.load(source.path, (file) => {
      //     this.sourceLoaded(source, file);
      //   });
      // } else
      if (source.type === "font") {
        this.loaders.fontLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      } else if (source.type === "texture") {
        this.loaders.textureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      }
    }
  }

  sourceLoaded(source, file) {
    this.items[source.name] = file;
    this.loaded++;
    if (this.loaded === this.toLoad) {
      this.trigger("ready");
    }
  }
}
