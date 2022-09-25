/* eslint-env node */

const { NodeCanvasFactory } = require("./NodeCanvasFactory");
const { existsSync } = require("fs");
const { getInputpath } = require("../getinputpath/index");
const fs = require("fs").promises;
const path = require("path");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf");
const CMAP_URL = "./node_modules/pdfjs-dist/cmaps/";
const STANDARD_FONT_DATA_URL = "./node_modules/pdfjs-dist/standard_fonts/";
const CMAP_PACKED = true;
const sharp = require("sharp");

const calcScale = (page, defScale, option) => {
  if (option.width === undefined) {
    return defScale;
  }
  const viewport = page.getViewport({ scale: 1.0 });
  return Math.max(defScale, option.height / viewport.height);
};

(async () => {
  try {
    const pdfpath = getInputpath();

    const pdfBasename = path.basename(pdfpath);
    const pDir = path.join(path.dirname(pdfpath), `${pdfBasename}_dir`);
    if (!existsSync(pDir)) {
      await fs.mkdir(pDir);
    }

    const pdfBlob = await fs.readFile(pdfpath);
    const byteAr = Uint8Array.from(pdfBlob);
    const pdfDoc = await pdfjsLib.getDocument({
      data: byteAr,
      cMapUrl: CMAP_URL,
      cMapPacked: CMAP_PACKED,
      standardFontDataUrl: STANDARD_FONT_DATA_URL,
    }).promise;
    const numPages = pdfDoc.numPages;
    for (let i = 1; i <= numPages; i++) {
      if (i % 30 === 0 || i === numPages || i === 1) {
        console.log(`処理中 ${i} / ${numPages}`);
      }
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({
        scale: calcScale(page, 2, { height: 1250 }),
      });
      const canvasFactory = new NodeCanvasFactory();
      const { canvas, context: canvasContext } = canvasFactory.create(
        viewport.width,
        viewport.height
      );
      const renderContext = {
        canvasContext,
        viewport,
        canvasFactory,
      };
      await page.render(renderContext).promise;
      const image = canvas.toBuffer();
      const fileName = `${(i + "").padStart(4, 0)}.jpeg`;
      const imageSharp = sharp(image);
      const imageMeta = await imageSharp.metadata();
      const buf = await imageSharp
        .resize(
          Math.floor(imageMeta.width * 0.95),
          Math.floor(imageMeta.height * 0.95)
        )
        .jpeg({
          quality: 85,
        })
        .toBuffer();
      fs.writeFile(path.join(pDir, fileName), buf);
      page.cleanup();
    }
  } catch (error) {
    console.error(error);
  }
})();
