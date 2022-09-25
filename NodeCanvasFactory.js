const assert = require("assert").strict;
const { createCanvas } = require("canvas");


module.exports.NodeCanvasFactory = class {
    constructor() {}
    create(width, height) {
      assert(width > 0 && height > 0, "Invalid canvas size");
      const canvas = createCanvas(width, height);
      const context = canvas.getContext("2d");
      return {
        canvas,
        context,
      };
    }
  
    reset(canvasAndContext, width, height) {
      assert(canvasAndContext.canvas, "Canvas is not specified");
      assert(width > 0 && height > 0, "Invalid canvas size");
      canvasAndContext.canvas.width = width;
      canvasAndContext.canvas.height = height;
    }
  
    destroy(canvasAndContext) {
      assert(canvasAndContext.canvas, "Canvas is not specified");
  
      // Zeroing the width and height cause Firefox to release graphics
      // resources immediately, which can greatly reduce memory consumption.
      canvasAndContext.canvas.width = 0;
      canvasAndContext.canvas.height = 0;
      canvasAndContext.canvas = null;
      canvasAndContext.context = null;
    }
  };