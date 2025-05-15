import Experience from "../Experience";
import Box from "./Box.js";
import * as THREE from "three";
import gsap from "gsap";

const positions = [
  // La Z siempre sera 0.2
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

  getRandom() {
    const pool = [0, 1, 2, 3];
    const result = [];

    // Barajamos la lista para obtener valores únicos al principio
    const shuffled = pool.sort(() => 0.5 - Math.random());

    // Escogemos entre 2 y 4 valores únicos, según cuánta diversidad queramos
    const uniqueCount = Math.floor(Math.random() * 2) + 2; // entre 2 y 3 valores únicos

    // Agrega valores únicos al resultado
    for (let i = 0; i < uniqueCount; i++) {
      result.push(shuffled[i]);
    }

    // Rellena el resto (hasta 4) con valores aleatorios, con posibilidad de repetir
    while (result.length < 4) {
      const random = result[Math.floor(Math.random() * uniqueCount)];
      result.push(random);
    }

    // Baraja el resultado para no dejar los valores únicos siempre al principio
    return result.sort(() => 0.5 - Math.random());
  }

  setGame() {
    const [vec1X, vec1Y, vec2X, vecY] = this.getRandom();
    const startPos1 = [vec1X, vec1Y];
    const startPos2 = [vec2X, vecY];

    for (let i = 0; i < positions.length; i++) {
      if (i == startPos1[0]) {
        for (let j = 1; j < positions.length + 1; j++) {
          if (j == startPos1[1]) {
            occupied[startPos1[0]][startPos1[1]] = new Box(
              positions[startPos1[0]][startPos1[1]]
            );
          }
        }
      }
    }
    for (let i = 0; i < positions.length; i++) {
      if (i == startPos2[0]) {
        for (let j = 0; j < positions.length; j++) {
          if (j == startPos2[1]) {
            occupied[startPos2[0]][startPos2[1]] = new Box(
              positions[startPos2[0]][startPos2[1]]
            );
          }
        }
      }
    }
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
  }

  move(direction) {
    let moved = false;

    const directions = {
      up: { x: 0, y: -1, start: 1, end: 4, step: 1 },
      down: { x: 0, y: 1, start: 2, end: -1, step: -1 },
      left: { x: -1, y: 0, start: 1, end: 4, step: 1 },
      right: { x: 1, y: 0, start: 2, end: -1, step: -1 },
    };

    const d = directions[direction];

    for (let outer = 0; outer < 4; outer++) {
      for (let inner = d.start; inner !== d.end; inner += d.step) {
        let row = d.x ? outer : inner;
        let col = d.x ? inner : outer;

        const box = occupied[row][col];
        if (box === "") continue;

        let newRow = row;
        let newCol = col;

        for (let i = 1; i < 4; i++) {
          const r = row + i * d.y;
          const c = col + i * d.x;

          if (r < 0 || r >= 4 || c < 0 || c >= 4) break;

          if (occupied[r][c] === "") {
            newRow = r;
            newCol = c;
          } else if (
            occupied[r][c].value === box.value &&
            !occupied[r][c].merged
          ) {
            newRow = r;
            newCol = c;
            break;
          } else {
            break;
          }
        }

        if (newRow !== row || newCol !== col) {
          moved = true;

          if (occupied[newRow][newCol] === "") {
            occupied[newRow][newCol] = box;
            occupied[row][col] = "";
            box.moveTo(
              positions[newRow][newCol].x,
              positions[newRow][newCol].y
            );
          } else {
            const mergedBox = occupied[newRow][newCol];
            mergedBox.value *= 2;
            mergedBox.merged = true;

            box.moveTo(
              positions[newRow][newCol].x,
              positions[newRow][newCol].y
            );
            box.remove();
            occupied[row][col] = "";
          }
        }
      }
    }

    // Eliminar las marcas de fusión
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++)
        if (occupied[i][j] !== "" && occupied[i][j].merged)
          delete occupied[i][j].merged;

    if (moved) this.addRandomBox();
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
  }

  update() {}
}
