import moment from "moment";

export default class DateUtil {
  static getCalendarWeek(date) {
    const momentDate = moment(date, ["DD.MM.YYYY"]);
    return momentDate.weeks();
  }

  static getCurrentYearAfterDate(beginning, currentDate) {
    const duration = moment.duration(
      moment(currentDate).diff(moment(beginning))
    );
    return Math.ceil(duration.asYears());
  }
}
