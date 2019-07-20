const functions = require("firebase-functions");
const admin = require("firebase-admin");

module.exports = functions.https.onRequest((req, res) => {
  let usersRef = admin
    .firestore()
    .collection("Users")
    .get()
    .then(snapshots => {
      snapshots.forEach(doc => {
        doc.ref
          .collection("Zeiterfassung")
          .get()
          .then(snapshots => {
            snapshots.forEach(doc => {
              console.log("Updating " + doc.ref.path);
              doc.ref.update({
                pauseMinuten: Number(doc.data().pauseMinuten)
              });
            });
          });
      });
    })
    .then(() => res.send("OK"));
});
