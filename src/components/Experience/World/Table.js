import Experience from "../Experience";
import Box from "./Box.js";
import * as THREE from "three";
import gsap from "gsap";

let points = 0;

const positions = [
  [
    new THREE.Vector2(-1.43, 1.37),
    new THREE.Vector2(-0.475, 1.37),
    new THREE.Vector2(0.475, 1.37),
    new THREE.Vector2(1.43, 1.37),
  ],
  [
    new THREE.Vector2(-1.43, 0.41),
    new THREE.Vector2(-0.475, 0.41),
    new THREE.Vector2(0.475, 0.41),
    new THREE.Vector2(1.43, 0.41),
  ],
  [
    new THREE.Vector2(-1.43, -0.54),
    new THREE.Vector2(-0.475, -0.54),
    new THREE.Vector2(0.475, -0.54),
    new THREE.Vector2(1.43, -0.54),
  ],
  [
    new THREE.Vector2(-1.43, -1.49),
    new THREE.Vector2(-0.475, -1.49),
    new THREE.Vector2(0.475, -1.49),
    new THREE.Vector2(1.43, -1.49),
  ],
];

let occupied = [
  ["", "", "", ""],
  ["", "", "", ""],
  ["", "", "", ""],
  ["", "", "", ""],
];

export default class Table {
  constructor() {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.time = this.experience.time;
    this.scene = this.experience.scene;
    this.normalTexture = this.experience.resources.items.TableNormalTexture;
    this.displacementTexture =
      this.experience.resources.items.TableDisplacementTexture;
    this.gradientTexture = this.experience.resources.items.GradientMapTexture;
    this.setGeometry();
    this.setGame();
    this.setListeners();
  }

  setGeometry() {
    var settings = {
      radius: { value: 0.1 },
    };
    this.boxGeom = new THREE.BoxGeometry(4, 4, 0.4, 50, 40, 30);
    this.boxMat = new THREE.MeshStandardMaterial({
      normalMap: this.normalTexture,
      color: 0xbbada0,
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
    this.extrude = new THREE.Mesh(this.boxGeom, this.boxMat);
    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.75, 3.75),
      new THREE.MeshStandardMaterial({
        color: 0xbbada0,
        side: THREE.DoubleSide,
      })
    );
    this.plane.position.z = -0.201;
    this.extrude.rotation.y = Math.PI;
    this.scene.add(this.extrude, this.plane);
  }

  setGame() {
    document.querySelector('.game-over').style.display = 'none'
    document.querySelector('.game-over').style.opacity = 0
    this.addRandomBox();
    this.addRandomBox();
  }

  addRandomBox() {
    const empty = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (occupied[i][j] === "") {
          empty.push({ i, j });
        }
      }
    }

    if (empty.length === 0) return;

    const { i, j } = empty[Math.floor(Math.random() * empty.length)];
    const value = Math.random() > 0.1 ? 2 : 4;
    const box = new Box(positions[i][j], value);
    occupied[i][j] = box;

    if (this.isGameOver()) {
      setTimeout(() => {
        document.querySelector('.game-over').style.display = 'flex'
        document.querySelector('.game-over').style.opacity = 1
        //alert("Game Over");
      }, 300);
    }
  }

  isGameOver() {
    // Si hay algún espacio vacío, no es game over
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (occupied[i][j] === "") return false;

        // Revisa vecinos adyacentes para ver si se puede fusionar
        const current = occupied[i][j];
        const neighbors = [
          [i - 1, j],
          [i + 1, j],
          [i, j - 1],
          [i, j + 1],
        ];

        for (let [ni, nj] of neighbors) {
          if (ni >= 0 && ni < 4 && nj >= 0 && nj < 4) {
            const neighbor = occupied[ni][nj];
            if (neighbor && neighbor.value === current.value) {
              return false; // Se puede fusionar
            }
          }
        }
      }
    }

    // Si no hay espacio ni fusiones posibles
    return true;
  }

  move(direction) {
    const vector = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
    }[direction];

    let moved = false;

    // Define el orden correcto de recorrido para cada dirección
    const range = [0, 1, 2, 3];
    const reverse = [3, 2, 1, 0];
    const rows =
      direction === "up" ? range : direction === "down" ? reverse : range;
    const cols =
      direction === "left" ? range : direction === "right" ? reverse : range;

    // Limpiar marcas de fusión
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++)
        if (occupied[i][j] !== "" && occupied[i][j].merged)
          delete occupied[i][j].merged;

    for (let i of rows) {
      for (let j of cols) {
        let row = i;
        let col = j;
        let box = occupied[row][col];
        if (box === "") continue;

        let newRow = row;
        let newCol = col;

        while (true) {
          const nextRow = newRow + vector.y;
          const nextCol = newCol + vector.x;

          if (nextRow < 0 || nextRow > 3 || nextCol < 0 || nextCol > 3) break;

          const nextBox = occupied[nextRow][nextCol];

          if (nextBox === "") {
            newRow = nextRow;
            newCol = nextCol;
          } else if (
            nextBox.value === box.value &&
            !nextBox.merged &&
            !box.merged
          ) {
            newRow = nextRow;
            newCol = nextCol;
            break;
          } else {
            break;
          }
        }

        if (newRow !== row || newCol !== col) {
          const targetBox = occupied[newRow][newCol];

          if (targetBox === "") {
            occupied[newRow][newCol] = box;
            occupied[row][col] = "";
            box.moveTo(
              positions[newRow][newCol].x,
              positions[newRow][newCol].y
            );
          } else if (targetBox.value === box.value && !targetBox.merged) {
            targetBox.value *= 2;
            targetBox.updateLabel?.();
            targetBox.merged = true;
            points += targetBox.value;

            box.moveTo(
              positions[newRow][newCol].x,
              positions[newRow][newCol].y
            );
            setTimeout(() => {
              box.remove();
              occupied[row][col] = "";
              document.querySelector(".points-number").innerHTML = points;
            }, 100);
          }

          moved = true;
        }
      }
    }

    if (moved) {
      setTimeout(() => {
        this.addRandomBox();
      }, 200);
    }
  }

  setListeners() {
    window.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "ArrowUp":
          this.move("up");
          break;
        case "ArrowDown":
          this.move("down");
          break;
        case "ArrowLeft":
          this.move("left");
          break;
        case "ArrowRight":
          this.move("right");
          break;
      }
    });

    document.querySelector(".newgame-button").addEventListener("click", () => {
      // Eliminar todos los Box del scene y del array ocupado
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (occupied[i][j] !== "") {
            occupied[i][j].remove(); // Remueve de la escena
            occupied[i][j] = "";
          }
        }
      }

      points = 0;
      document.querySelector(".points-number").innerHTML = points;

      this.setGame();
    });

    document.querySelector(".gameover-button").addEventListener("click", () => {
      // Eliminar todos los Box del scene y del array ocupado
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (occupied[i][j] !== "") {
            occupied[i][j].remove(); // Remueve de la escena
            occupied[i][j] = "";
          }
        }
      }

      points = 0;
      document.querySelector(".points-number").innerHTML = points;

      this.setGame();
    });
  }

  update() {}
}
