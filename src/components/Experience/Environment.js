import Experience from "./Experience.js";
import * as THREE from "three";

export default class Environment {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.setLights();
  }

  setLights() {
    const width = 7;
    const height = 7;
    const intensity = 0.75;
    const rectLight = new THREE.RectAreaLight(
      0xffffff,
      intensity,
      width,
      height
    );
    rectLight.position.set(2, 2, 0);
    rectLight.lookAt(0, 0, 0);

    const rectLight2 = new THREE.RectAreaLight(
      0xffffff,
      intensity,
      width,
      height
    );
    rectLight2.position.set(-2, -2, 0);
    rectLight2.lookAt(0, 0, 0);

    this.scene.add(rectLight, rectLight2);
  }
}
