const functions = require("firebase-functions");
const admin = require("firebase-admin");
var JSZip = require("jszip");
var Docxtemplater = require("docxtemplater");
var tmp = require("tmp");
var fs = require("fs");
var path = require("path");
const DateUtil = require("./util/DateUtil");
const moment = require("moment");

const bucket = admin.storage().bucket();

/**
 * Data should contain user email
 */
module.exports = functions.https.onRequest((req, res) => {
  const email = req.query.email;

  if (!(typeof email == "string")) {
    throw new Error(
      `Passed Data is of type ${typeof email}, should be ${typeof ""}`
    );
  }

  const userData = admin
    .firestore()
    .collection("Users")
    .doc(email)
    .get();

  const berichtData = admin
    .firestore()
    .collection("Users")
    .doc(email)
    .collection("Berichte")
    .get()
    .then(data => data.docs);

  const documentPaths = userData
    .then(user => user.data())
    .then(user => {
      return berichtData.then(berichte => {
        return berichte.map(berichtDoc => {
          const bericht = berichtDoc.data();
          const calendarWeek = moment(bericht.dateStart, [
            "DD.MM.YYYY"
          ]).weeks();

          const ausbildungsJahr = DateUtil.default.getCurrentYearAfterDate(
            user.ausbildungsanfang,
            moment().format("DD.MM.YYYY")
          );

          return createFile({
            name: user.name,
            betrieb: user.betrieb,
            ausbilder: user.ausbilder,
            abteilung: user.abteilung,
            projekt: user.projekt,
            bericht_von: bericht.bericht_von,
            bericht_bis: bericht.bericht_bis,
            nachweisnr: berichtDoc.id,
            kalenderwoche: calendarWeek,
            ausbildungs_jahr: ausbildungsJahr,
            taetigkeiten: bericht.taetigkeiten,
            schulungen: bericht.schulungen,
            schule: bericht.schule,
            datum_heute: bericht.datum_heute || moment().format("DD.MM.YYYY"),
            stadt: user.stadt || "Braunschweig"
          });
        });
      });
    });

  const zip = new JSZip().folder("berichte_" + email);

  documentPaths.then(paths => {
    paths.forEach(path => {
      const fileName = path.split("/")[path.split("/").length - 1];
      zip.file(fileName, fs.readFileSync(path));
    });
  });

  zip.generateAsync({ type: "blob" }).then(content => {
    fs.writeFileSync(path.resolve(__dirname, "berichte.zip", content));
    res.download(path.resolve(__dirname, "berichte.zip"));
  });
});

/**
 *
 * @param {Object} data Object containing all data fields
 * @returns {string} path of docx file
 */
function createFile(data) {
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

  let outfile = tmp.fileSync({ template: documentName });
  // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
  fs.writeFileSync(path.resolve(outfile.name), buf);
  console.log(outfile);

  let localPath = path.resolve(outfile.name);
}
