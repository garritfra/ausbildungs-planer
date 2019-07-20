const functions = require("firebase-functions");
const admin = require("firebase-admin");
const moment = require("moment");

module.exports = functions.firestore
  .document("Users/{userEmail}/Zeiterfassung/{timesheetId}")
  .onWrite((change, context) => {
    // Realtime database does not allow dots :(
    return admin
      .auth()
      .getUserByEmail(context.params.userEmail)
      .then(user => {
        const data = change.after.data();
        const dateStart = moment(data.beginn, "HH:mm");
        const dateEnd = moment(data.ende, "HH:mm");
        const breakMinutes = Number(data.pauseMinuten);

        const workingTime = dateEnd.diff(dateStart, "minute") - breakMinutes;
        console.log(
          `Working minutes for date ${
            change.after.id
          }: ${workingTime.toString()}`
        );
        console.log("Break Minutes: " + breakMinutes);
        const diff = workingTime / 60 - 7.5;
        console.log("Time Difference added to balance: " + diff);

        return admin
          .database()
          .ref(`/cache/${user.uid}/timebalance`)
          .once("value")
          .then(value => value.val())
          .then(value => {
            let currentBalance = value ? Number(value) : 0;
            let newBalance = currentBalance + diff;
            console.log("Old balance: " + currentBalance);
            console.log("New balance: " + newBalance);
            return admin
              .database()
              .ref(`/cache/${user.uid}/timebalance`)
              .set(newBalance);
          })
          .catch(err => err);
      });
  });
