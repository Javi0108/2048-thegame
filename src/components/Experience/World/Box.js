import Experience from "../Experience";
import * as THREE from "three";
import gsap from "gsap";
import { TextGeometry } from "three/examples/jsm/Addons.js";

export default class Box {
  constructor(position, value = 2) {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.time = this.experience.time;
    this.scene = this.experience.scene;
    this.positionX = position.x;
    this.positionY = position.y;
    this.font = this.experience.resources.items.ClearSansFont;
    this.value = value;
    this.setGeometry();
    //this.setListeners();
  }

  setGeometry() {
    var settings = {
      radius: { value: 0.3 },
    };
    this.boxGeom = new THREE.BoxGeometry(0.75, 0.75, 0.3, 50, 40, 30);
    this.boxMat = new THREE.MeshStandardMaterial({
      color: "#EEE4DA",
    });
    this.boxMat.onBeforeCompile = (shader) => {
      shader.uniforms.boxSize = {
        value: new THREE.Vector3(
          this.boxGeom.parameters.width,
          this.boxGeom.parameters.height,
          this.boxGeom.parameters.depth
        ).multiplyScalar(0.5),
      };
      shader.uniforms.radius = settings.radius;
      shader.vertexShader =
        `
        uniform vec3 boxSize;
        uniform float radius;
        ` + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        `#include <begin_vertex>`,
        `#include <begin_vertex>
    
        float maxRadius = clamp(radius, 0.0, min(boxSize.x, min(boxSize.y, boxSize.z)));
        vec3 signs = sign(position);
        
        vec3 subBox = boxSize - vec3(maxRadius);
        
        vec3 absPos = abs(transformed); 
        // xy
        vec2 sub = absPos.xy - subBox.xy;
        if (absPos.x > subBox.x && absPos.y > subBox.y && absPos.z <= subBox.z) {
        transformed.xy = normalize(sub) * maxRadius + subBox.xy;
        transformed.xy *= signs.xy;
        }
        // xz
        sub = absPos.xz - subBox.xz;
        if (absPos.x > subBox.x && absPos.z > subBox.z && absPos.y <= subBox.y) {
        transformed.xz = normalize(sub) * maxRadius + subBox.xz;
        transformed.xz *= signs.xz;
        }
        // yz
        sub = absPos.yz - subBox.yz;
        if (absPos.y > subBox.y && absPos.z > subBox.z && absPos.x <= subBox.x) {
        transformed.yz = normalize(sub) * maxRadius + subBox.yz;
        transformed.yz *= signs.yz;
        }
        
        // corner
        if (all(greaterThan(absPos, subBox))){
        vec3 sub3 = absPos - subBox;
        transformed = (normalize(sub3) * maxRadius + subBox) * signs;
        }
        
        // re-compute normals for correct shadows and reflections
        objectNormal = all(equal(position, transformed)) ? normal : normalize(position - transformed); 
        transformedNormal = normalMatrix * objectNormal; 

        `
      );
    };
    this.cube = new THREE.Mesh(this.boxGeom, this.boxMat);
    this.cube.rotation.y = Math.PI;
    this.cube.position.set(this.positionX, this.positionY, 0.15); //(-1.43, -1.49, 0.2);

    this.cubeValueGeometry = new TextGeometry(this.value.toString(), {
      font: this.font,
      size: 0.35,
      depth: 0.3,
    })
    this.cubeValueMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
    this.cubeValue = new THREE.Mesh(this.cubeValueGeometry, this.cubeValueMaterial)
    this.cubeValue.position.set(this.positionX - 0.15, this.positionY - 0.15, 0.025)

    this.group = new THREE.Group()
    this.group.add(this.cube, this.cubeValue)
    this.scene.add(this.group);
  }

  moveTo(newX, newY) {
    this.positionX = newX;
    this.positionY = newY;
    gsap.to(this.cube.position, {
      x: newX,
      y: newY,
      duration: 0.2,
      ease: "power2.out",
    });

    gsap.to(this.cubeValue.position, {
      x: newX - 0.15,
      y: newY - 0.15,
      duration: 0.2,
      ease: "power2.out",
    });
  }

  remove() {
    this.scene.remove(this.group);
  }

  setListeners() {}

  update() {}
}
