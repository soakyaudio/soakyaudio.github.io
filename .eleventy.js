const { DateTime } = require("luxon");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor")

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

    // markdown rendering: anchors for all headings
    const markdownLibrary = markdownIt({
        html: true,
    }).use(markdownItAnchor, {
        permalink: markdownItAnchor.permalink.ariaHidden({
            class: "anchor-link",
            placement: "after",
            symbol: "#",
        }),
        level: [1, 2, 3],
    });
    eleventyConfig.setLibrary("md", markdownLibrary);
};
