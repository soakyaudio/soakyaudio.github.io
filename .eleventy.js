const { DateTime } = require("luxon");

module.exports = (eleventyConfig) => {
    // passthrough
    eleventyConfig.addPassthroughCopy("css");
    eleventyConfig.addPassthroughCopy("img");

    // date formatters
    eleventyConfig.addFilter("readableDate", (date) => {
        return DateTime.fromJSDate(date, { zone: "utc" }).toLocaleString(DateTime.DATE_FULL);
    });
    eleventyConfig.addFilter('htmlDateString', (date) => {
        return DateTime.fromJSDate(date, { zone: "utc" }).toISODate();
    });

    // year shortcode
    eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);
};
