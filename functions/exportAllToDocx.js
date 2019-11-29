const functions = require("firebase-functions");
const admin = require("firebase-admin");
var JSZip = require("jszip");
var Docxtemplater = require("docxtemplater");
var tmp = require("tmp");
var fs = require("fs");
var path = require("path");
const DateUtil = require("./util/DateUtil");
const moment = require("moment");
const zipFolder = require("zip-folder");

const bucket = admin.storage().bucket();

/**
 * Data should contain user email
 */
module.exports = functions.https.onRequest((req, res) => {
  const dir = tmp.dirSync({ mode: "0777" });

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

          const ausbildungsJahr = DateUtil.getCurrentYearAfterDate(
            user.ausbildungsanfang,
            moment().format("DD.MM.YYYY")
          );
          console.log(bericht);

          return createFile(
            {
              name: user.name,
              betrieb: user.betrieb,
              ausbilder: user.ausbilder,
              abteilung: user.abteilung,
              projekt: user.projekt,
              bericht_von: bericht.dateStart,
              bericht_bis: bericht.dateEnd,
              nachweisnr: berichtDoc.id,
              kalenderwoche: calendarWeek,
              ausbildungs_jahr: ausbildungsJahr,
              taetigkeiten: bericht.activities,
              schulungen: bericht.instructions,
              schule: bericht.school,
              datum_heute: bericht.datum_heute || moment().format("DD.MM.YYYY"),
              stadt: user.stadt || "Braunschweig"
            },
            dir
          );
        });
      });
    });

  documentPaths.then(paths => {
    const dirPath = dir.name;
    zipFolder(dirPath, path.join(dirPath, "berichte.zip"), err => {
      if (err) res.send(err);
      res.download(path.resolve(dirPath, "berichte.zip"));
    });
  });
});

/**
 *
 * @param {Object} data Object containing all data fields
 * @returns {string} path of docx file
 */
function createFile(data, dir) {
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
  let outfile = tmp.fileSync({
    postfix: documentName,
    mode: "0777",
    dir: dir.name
  });
  // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
  const file = fs.writeFileSync(outfile.name, buf, { mode: "0777" });
  console.log(outfile);

  return path.resolve(outfile.name);
}
