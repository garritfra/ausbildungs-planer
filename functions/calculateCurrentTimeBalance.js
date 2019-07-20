const functions = require("firebase-functions");
const admin = require("firebase-admin");
const moment = require("moment");

module.exports = functions.https.onRequest((req, res) => {
  admin
    .firestore()
    .collection("Users")
    .get()
    .then(users => {
      return users.forEach(user => {
        return user.ref
          .collection("Zeiterfassung")
          .get()
          .then(timesheets => {
            let balance = 0;
            timesheets.forEach(timesheet => {
              console.log("Processing " + timesheet.ref.path);

              const data = timesheet.data();
              const dateStart = moment(data.beginn, "HH:mm");
              const dateEnd = moment(data.ende, "HH:mm");
              const breakMinutes = Number(data.pauseMinuten);
              console.log("Timesheet: " + JSON.stringify(data));
              const workingTime =
                dateEnd.diff(dateStart, "minute") - breakMinutes;
              console.log(
                `Working minutes for date ${
                  timesheet.id
                }: ${workingTime.toString()}`
              );
              console.log("Break Minutes: " + breakMinutes);
              const diff = workingTime / 60 - 7.5;
              console.log("Time Difference added to balance: " + diff);
              balance += diff;
            });
            console.log("User Email: " + user.id);
            return admin
              .auth()
              .getUserByEmail(user.id)
              .then(user => {
                console.log("User UID: " + user.uid);
                return admin
                  .database()
                  .ref(`/cache/${user.uid}/timebalance`)
                  .set(balance);
              });
          });
      });
    })
    .then(() => res.send("OK"));
});
