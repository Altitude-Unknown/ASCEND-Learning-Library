export default {
  layout: 'layouts/base.njk',
  eleventyComputed: {
    permalink: data => data.permalink || `${data.page.filePathStem.replace(/\/index$/, '')}/`
  }
};
