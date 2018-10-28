import moment from "moment";

export default class DateUtil {
  static getCalendarWeek(date) {
    const dateMoment = moment(date);
    console.log(dateMoment.weeks());
    return dateMoment.week();
  }

  static getCurrentYearAfterDate(beginning, currentDate) {
    const duration = moment.duration(
      moment(currentDate).diff(moment(beginning))
    );
    return Math.ceil(duration.asYears());
  }
}
