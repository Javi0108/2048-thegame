import Experience from "../Experience";
import * as THREE from "three";
import gsap from "gsap";
import { TextGeometry } from "three/examples/jsm/Addons.js";

const lightThemeCcolor = [
  "#EEE4DA",
  "#EDE0C8",
  "#F2B179",
  "#F59563",
  "#F67C5F",
  "#F65E3B",
  "#EDCF72",
  "#EDCC61",
  "#EDC850",
  "#EDC53F",
  "#EDC22E",
  "#CDC1B4",
];

export default class Box {
  constructor(position, value = 2) {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.time = this.experience.time;
    this.animationDuration = 1000; // en milisegundos
    this.animationStartTime = this.time.elapsed; // tiempo inicial 400ms
    this.scene = this.experience.scene;
    this.positionX = position.x;
    this.positionY = position.y;
    this.font = this.experience.resources.items.ClearSansFont;
    this.value = value;
    this.setGeometry();
  }

  getColor() {
    if (this.value === 2) return "#CDC1B4";
    return lightThemeCcolor[Math.log2(this.value) - 1];
  }

  setGeometry() {
    var settings = {
      radius: { value: 0.3 },
    };

    this.boxGeom = new THREE.BoxGeometry(0.8, 0.8, 0.2, 50, 40, 30);
    this.boxMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.getColor()),
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
    this.cube.castShadow = true;
    this.cube.receiveShadow = true;
    this.cube.rotation.y = Math.PI;
    this.cube.position.set(this.positionX, this.positionY, 0.15);

    const paddingX = [0.12, 0.22, 0.3, 0.33];
    const paddingY = [0.125, 0.1];
    const sizes = [0.3, 0.25, 0.2];
    if (this.value.toString().length == 1) {
      this.fontSize = sizes[0];
      this.textPaddingX = paddingX[0];
      this.textPaddingY = paddingY[0];
    } else if (this.value.toString().length == 2) {
      this.fontSize = sizes[1];
      this.textPaddingX = paddingX[1];
      this.textPaddingY = paddingY[0];
    } else if (this.value.toString().length == 3) {
      this.fontSize = sizes[1];
      this.textPaddingX = paddingX[2];
      this.textPaddingY = paddingY[0];
    } else if (this.value.toString().length == 4) {
      this.fontSize = sizes[2];
      this.textPaddingX = paddingX[3];
      this.textPaddingY = paddingY[1];
    }

    this.cubeValueGeometry = new TextGeometry(this.value.toString(), {
      font: this.font,
      size: this.fontSize,
      depth: 0.275,
    });
    this.cubeValueMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.cubeValue = new THREE.Mesh(
      this.cubeValueGeometry,
      this.cubeValueMaterial
    );
    this.cubeValue.castShadow = true;
    this.cubeValue.receiveShadow = true;
    this.cubeValue.position.set(
      this.positionX - this.textPaddingX,
      this.positionY - this.textPaddingY,
      0
    );

    this.group = new THREE.Group();
    this.group.add(this.cube, this.cubeValue);
    this.scene.add(this.group);
  }

  updateLabel() {
    this.group.remove(this.cube, this.cubeValue); // Quitar el texto viejo
    this.setGeometry(); // Crear uno nuevo
    this.cubeValue.position.set(
      this.positionX - this.textPaddingX,
      this.positionY - this.textPaddingY,
      0
    );
    this.group.add(this.cubeValue); // Añadir el texto nuevo
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
      x: newX - this.textPaddingX,
      y: newY - this.textPaddingY,
      duration: 0.2,
      ease: "power2.out",
    });
  }

  remove() {
    if (this.group && this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }

  update() {
    const elapsed = this.time.elapsed - this.animationStartTime;
    const progress = Math.min(elapsed / this.animationDuration, 1);

    const scale = progress * 1;
    this.cube.scale.set(scale, scale, scale);
  }
}
