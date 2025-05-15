import Experience from "../Experience";
import * as THREE from "three";
import { gsap } from "gsap";

export default class LoadingSquare {
  constructor() {
    this.experience = new Experience();
    this.time = this.experience.time;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.setGeometry();
    this.setListeners();
  }

  setGeometry() {
    this.geometry = new THREE.PlaneGeometry(2, 2, 1, 1);
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uAlpha: { value: 1 },
      },
      fragmentShader: `
        uniform float uAlpha;
        void main(){
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
        `,
    });

    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.plane.position.set(0, 0, 1);
    //this.scene.add(this.plane);
  }

  setListeners() {
    this.resources.on("ready", () => {
      window.setTimeout(() => {
        gsap.to(this.material.uniforms.uAlpha, { duration: 3, value: 0 });
      }, 500)
    });
  }

  update() {
    if (this.model && this.model.position.z <= 0) {
      this.model.position.z += 0.05 * this.time.delta * 0.0015;
    }
  }
}
