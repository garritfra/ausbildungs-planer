const admin = require("firebase-admin");
if (process.env.FIREBASE_STAGE == "production") {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://ausbildungs-planer.firebaseio.com",
    storageBucket: "ausbildungs-planer.appspot.com"
  });
} else {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: "ausbildungs-planer-dev.appspot.com",
    databaseURL: "https://ausbildungs-planer-dev.firebaseio.com"
  });
}

exports.exportToDocx = require("./exportToDocx");
exports.addTimesheet = require("./addTimesheet");
exports.sanitizeBreakMinutes = require("./sanitizeBreakMinutes");
exports.updateCurrentTimeBalance = require("./updateCurrentTimeBalance");
