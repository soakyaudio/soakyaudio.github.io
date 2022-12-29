const { DateTime } = require("luxon");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor")
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight")
const htmlmin = require("html-minifier")
const cleanCss = require("clean-css");

module.exports = (eleventyConfig) => {
    // plugins
    eleventyConfig.addPlugin(syntaxHighlight);

    // passthrough
    eleventyConfig.addPassthroughCopy("css");
    eleventyConfig.addPassthroughCopy("img");
    eleventyConfig.addPassthroughCopy("robots.txt");

    // date formatters
    eleventyConfig.addFilter("readableDate", (date) => {
        return DateTime.fromJSDate(date, { zone: "utc" }).toLocaleString(DateTime.DATE_FULL);
    });
    eleventyConfig.addFilter("htmlDateString", (date) => {
        return DateTime.fromJSDate(date, { zone: "utc" }).toISODate();
    });

    // inline css
    eleventyConfig.addFilter("cssmin", (code) => {
        return new cleanCss({}).minify(code).styles;
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

    // minify html
    eleventyConfig.addTransform("htmlmin", (content, outputPath) => {
        if (outputPath.endsWith(".html")) {
            return htmlmin.minify(content, {
                collapseWhitespace: true,
                removeComments: true,
            });
        }
        return content;
    });
};
