import Experience from "./Experience.js";
import * as THREE from "three";

export default class Environment {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.setLights();
    //this.setEnvironmentMap();
  }

  setLights() {
    const width = 15;
    const height = 15;
    const intensity = 1;
    const rectLight = new THREE.RectAreaLight(
      0xffffff,
      intensity,
      width,
      height
    );
    rectLight.position.set(5, 5, -1);
    rectLight.lookAt(0, 0, 0);

    const rectLight2 = new THREE.RectAreaLight(
      0xffffff,
      intensity,
      width,
      height
    );
    rectLight2.position.set(-5, -5, -1);
    rectLight2.lookAt(0, 0, 0);

    this.scene.add(rectLight, rectLight2);
  }

  // setEnvironmentMap() {
  //   this.environmentMap = {};
  //   this.environmentMap.intensity = 0.4;
  //   this.environmentMap.texture = this.resources.items.environmentMapTexture;
  //   this.environmentMap.texture.mapping = THREE.EquirectangularReflectionMapping;
  //   this.environmentMap.texture.colorSpace = THREE.SRGBColorSpace;

  //   this.environmentMap.updateMaterials = () => {
  //     this.scene.traverse((child) => {
  //       if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
  //         //child.material.envMap = this.environmentMap.texture;
  //         child.material.envMapIntensity = this.environmentMap.intensity;
  //         child.material.needsUpdate = true;
  //       }
  //     });
  //   };
  //   this.environmentMap.updateMaterials();
  // }
}
