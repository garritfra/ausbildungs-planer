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
  doc.loadZip(zip);

  doc.setData({
    name: "Garrit Frnkae",
    betrieb: "ckc",
    ausbilder: "Jonas",
    abteilung: "Mobile Lab",
    projekt: "Ausbildung",
    bericht_von: "01.03.2018",
    bericht_bis: "05.03.2018",
    nachweisnr: "50",
    kalenderwoche: 24,
    ausbildungs_jahr: 1,
    taetigkeiten: "- asdölkasdlöaskd",
    schulungen: "-aslkdjlasd",
    schule: "löaskdölasödkasd",
    datum_heute: "12.02.2019"
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
  var documentName = "AusbNachweis_" + "20" + ".docx";
  let outfile = tmp.fileSync();
  // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
  fs.writeFileSync(path.resolve(outfile.name), buf);
  console.log(outfile);
  res.download(path.resolve(outfile.name), documentName);
});
