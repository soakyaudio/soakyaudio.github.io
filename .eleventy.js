const { DateTime } = require("luxon");

module.exports = (eleventyConfig) => {
    // date formatters
    eleventyConfig.addFilter("readableDate", (date) => {
        return DateTime.fromJSDate(date, { zone: "utc" }).toLocaleString(DateTime.DATE_FULL);
    });
    eleventyConfig.addFilter('htmlDateString', (date) => {
        return DateTime.fromJSDate(date, { zone: "utc" }).toISODate();
    });
};
