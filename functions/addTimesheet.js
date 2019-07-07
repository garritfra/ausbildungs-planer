const admin = require("firebase-admin");
const functions = require("firebase-functions");

module.exports = functions.https.onCall(async (data, context) => {
  let date = data.date;
  let start = data.start;
  let end = data.end;
  let breakMinutes = data.breakMinutes;
  let activities = data.activities;
  console.log("Data: " + data);

  let user = await admin.auth().getUser(context.auth.uid);
  console.log("User: " + user);
  return admin
    .firestore()
    .collection("Users")
    .doc(user.email)
    .collection("Zeiterfassung")
    .doc(date)
    .set({
      beginn: start,
      ende: end,
      taetigkeiten: activities,
      pauseMinuten: breakMinutes
    });
});
