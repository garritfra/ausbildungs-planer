import moment from "moment";

/**
 * Takes in a date as a string in the format "DD.MM.YYYY"
 */
export default class DateUtil {
  static getCalendarWeek(date) {
    const momentDate = moment(date, ["DD.MM.YYYY"]);
    return momentDate.weeks();
  }

  /**
   * Takes in a date string with format "DD.MM.YYYY"
   * @param {String} beginning
   * @param {String} currentDate
   */
  static getCurrentYearAfterDate(beginning, currentDate) {
    const duration = moment.duration(
      moment(currentDate, ["DD.MM.YYYY"]).diff(
        moment(beginning, ["DD.MM.YYYY"])
      )
    );
    return Math.ceil(duration.asYears());
  }

  /**
   * Converts a yyyy-mm-dd date into dd.mm.yyyy
   * @param {string} old date in format "yyyy-mm-dd"
   */
  static correctFormat(old) {
    return moment(old, ["yyyy-MM-dd"]).format("dd.mm.yyyy");
  }
}
