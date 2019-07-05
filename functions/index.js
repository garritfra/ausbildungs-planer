const functions = require("firebase-functions");
const admin = require("firebase-admin");
var JSZip = require("jszip");
var Docxtemplater = require("docxtemplater");
var tmp = require("tmp");

var fs = require("fs");
var path = require("path");

admin.initializeApp();

const bucket = admin.storage().bucket();

exports.exportToDocx = functions.https.onCall((data, context) => {
  let content = fs.readFileSync(
    path.resolve(__dirname, "AusbNachweis_TEMPLATE.docx"),
    "binary"
  );

  let zip = new JSZip(content);

  let doc = new Docxtemplater();
  doc.setOptions({ linebreaks: true });
  doc.loadZip(zip);

  const today = new Date();
  const todayStr =
    today.getDate().toString() +
    "." +
    today.getMonth().toString() +
    "." +
    today.getFullYear().toString();

  doc.setData({
    name: data.name,
    betrieb: data.betrieb,
    ausbilder: data.ausbilder,
    abteilung: data.abteilung,
    projekt: data.projekt,
    bericht_von: data.bericht_von,
    bericht_bis: data.bericht_bis,
    nachweisnr: data.nachweisnr,
    kalenderwoche: data.kalenderwoche,
    ausbildungs_jahr: data.ausbildungs_jahr,
    taetigkeiten: data.taetigkeiten,
    schulungen: data.schulungen,
    schule: data.schule,
    datum_heute: data.datum_heute || todayStr,
    stadt: data.stadt || "Braunschweig"
  });

  try {
    // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
    doc.render();
  } catch (error) {
    var e = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      properties: error.properties
    };
    console.log(JSON.stringify({ error: e }));
    // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
    throw error;
  }

  var buf = doc.getZip().generate({ type: "nodebuffer" });
  var documentName =
    "AusbNachweis_" +
    data.name.replace(" ", "") +
    "_" +
    data.nachweisnr +
    ".docx";

  let outfile = tmp.fileSync();
  // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
  fs.writeFileSync(path.resolve(outfile.name), buf);
  console.log(outfile);

  let localPath = path.resolve(outfile.name);

  return bucket
    .upload(localPath, { destination: documentName })
    .then(file => file[0].name);
});
