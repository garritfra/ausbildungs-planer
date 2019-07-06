const admin = require("firebase-admin");
admin.initializeApp();

exports.exportToDocx = require("./exportToDocx");
exports.addTimesheet = require("./addTimesheet");
