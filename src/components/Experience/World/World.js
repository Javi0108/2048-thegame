import Experience from "../Experience.js";
import Environment from "../Environment.js";
import Table from "./Table.js";
import Box from "./Box.js";
import LoadingSquare from "./LoadingSquare.js";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    //this.loadingSquare = new LoadingSquare();

    this.resources.on("ready", () => {
      this.table = new Table();
      //this.box = new Box();
      this.environment = new Environment();
    });
  }

  update() {
    if (this.table) this.table.update();
  }
}
