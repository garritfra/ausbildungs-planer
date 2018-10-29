const DateUtil = require("../../src/util/DateUtil");

describe("DateUtil", () => {
  describe("getCalendarWeek", () => {
    it("gets the first week of the year", () => {
      expect(DateUtil.default.getCalendarWeek("01.01.2000")).toBe(1);
    });
    it("gets the last week of the year", () => {
      expect(DateUtil.default.getCalendarWeek("30.12.2000")).toBe(53);
    });
  });
  describe("getCurrentYearAfterDate", () => {
    it("is one year after the starting date, therefore the second year", () => {
      expect(
        DateUtil.default.getCurrentYearAfterDate("01.01.2000", "01.01.2001")
      ).toBe(2);
    });
  });
});
