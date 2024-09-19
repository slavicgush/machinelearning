const daw = require("../common/daw.js");
const cts = require("../common/cts.js");
const uis = require("../common/uis.js");
const gey = require("../common/gey.js");
const fus = require("../common/fus.js");

const { createCanvas } = require("cvs");
const cvs = createCanvas(400, 400);
const ctx = cvs.getContext("2d");

const fs = require("fs");


if (fs.existsSync(cts.DATASET_DIR)) {
   fs.readdirSync(cts.DATASET_DIR).forEach((fileName) =>
      fs.rmSync(cts.DATASET_DIR + "/" + fileName, { recursive: true })
   );
   fs.rmdirSync(cts.DATASET_DIR);
}
fs.mkdirSync(cts.DATASET_DIR);
fs.mkdirSync(cts.JSON_DIR);
fs.mkdirSync(cts.IMG_DIR);
if (!fs.existsSync(cts.MODELS_DIR)) {
   fs.mkdirSync(cts.MODELS_DIR);
}
console.log("GENERATING DATASET ...");


const fNs = fs.readdirSync(cts.RAW_DIR);
const sps = [];
let id = 1;
fNs.forEach((fn) => {
   const ctt = fs.readFileSync(cts.RAW_DIR + "/" + fn);
   const { session, student, drawings } = JSON.parse(ctt);
   for (let label in drawings) {
      if (!uis.flaggedSamples.includes(id)) {
         sps.push({
            id,
            label,
            student_name: student,
            student_id: session,
         });

         const pts = drawings[label];
         fs.writeFileSync(
            cts.JSON_DIR + "/" + id + ".json",
            JSON.stringify(pts)
         );

         generateImageFile(cts.IMG_DIR + "/" + id + ".png", pts);
      }
      uis.printProgress(id, fNs.length * 8);
      id++;
   }
});
console.log("\n");

fs.writeFileSync(cts.SAMPLES, JSON.stringify(sps));

fs.mkdirSync(cts.JS_OBJECTS, {recursive: true});
fs.writeFileSync(
   cts.SAMPLES_JS,
   "const sps = " + JSON.stringify(sps) + ";"
);

function generateImageFile(outFile, pts) {
   ctx.clearRect(0, 0, cvs.width, cvs.height);

   daw.pts(ctx, pts);

   const pes = fus.getPixels(pts);
   const sze = Math.sqrt(pes.length);
   const iDa = ctx.getImageData(0, 0, sze, sze);
   for (let i = 0; i < pes.length; i++) {
      const apa = pes[i];
      const sIx = i * 4;
      iDa.data[sIx] = 0;
      iDa.data[sIx + 1] = 0;
      iDa.data[sIx + 2] = 0;
      iDa.data[sIx + 3] = apa;
   }
   ctx.putImageData(iDa, 0, 0);

   const bfr = cvs.toBuffer("image/png");
   fs.writeFileSync(outFile, bfr);
}

