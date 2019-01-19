const functions = require("firebase-functions");
var JSZip = require("jszip");
var Docxtemplater = require("docxtemplater");
var tmp = require("tmp");

var fs = require("fs");
var path = require("path");

exports.exportToDocx = functions.https.onRequest((req, res) => {
  let content = fs.readFileSync(
    path.resolve(__dirname, "AusbNachweis_TEMPLATE.docx"),
    "binary"
  );

  let zip = new JSZip(content);

  let doc = new Docxtemplater();
  doc.setOptions({ linebreaks: true });
  doc.loadZip(zip);

  const today = new Date();

  // Month starts at 0, so 1 must be added
  today.setMonth(today.getMonth() + 1);

  const todayStr =
    today.getDate().toString() +
    "." +
    today.getMonth().toString() +
    "." +
    today.getFullYear().toString();

  doc.setData({
    name: req.query.name,
    betrieb: req.query.betrieb,
    ausbilder: req.query.ausbilder,
    abteilung: req.query.abteilung,
    projekt: req.query.projekt,
    bericht_von: req.query.bericht_von,
    bericht_bis: req.query.bericht_bis,
    nachweisnr: req.query.nachweisnr,
    kalenderwoche: req.query.kalenderwoche,
    ausbildungs_jahr: req.query.ausbildungs_jahr,
    taetigkeiten: req.query.taetigkeiten,
    schulungen: req.query.schulungen,
    schule: req.query.schule,
    datum_heute: req.query.datum_heute || todayStr,
    stadt: req.query.stadt || "Braunschweig"
  });

  console.log(todayStr);

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
  var documentName = "AusbNachweis_" + req.query.nachweisnr + ".docx";
  let outfile = tmp.fileSync();
  // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
  fs.writeFileSync(path.resolve(outfile.name), buf);
  console.log(outfile);
  res.download(path.resolve(outfile.name), documentName);
});
