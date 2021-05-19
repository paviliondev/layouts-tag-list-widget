import DiscourseURL from "discourse/lib/url";
import { createWidget } from "discourse/widgets/widget";
import { h } from "virtual-dom";

let layouts;

// Import layouts plugin with safegaurd for when widget exists without plugin:
try {
  layouts = requirejs(
    "discourse/plugins/discourse-layouts/discourse/lib/layouts"
  );
} catch (error) {
  layouts = { createLayoutsWidget: createWidget };
  console.warn(error);
}

export default layouts.createLayoutsWidget("tag-list", {
  html(attrs) {
    const { tags } = attrs;
    if (tags == null || tags == undefined) return;

    const tagListItems = [];
    const tagList = [];

    tagList.push(h("h3.l-tags-header", I18n.t(themePrefix("header_title"))));

    if (tags.length == 0) {
      tagList.push(h("p.l-tag-none", "No tags have been created"));
      return tagList;
    }

    tags.forEach((tag) => {
      //   tagList.push(h("p.discourse-tag", tag.text));
      tagListItems.push(this.attach("layouts-tag-link", tag));
    });

    tagList.push(h("ul.l-tag-items", tagListItems));
    return tagList;
  },
});

createWidget("layouts-tag-link", {
  tagName: "li.l-tag-link",
  buildKey: (attrs) => `layouts-tag-link-${attrs.id}`,

  getTagTitle(tag) {
    // todo make tag display type based on discourse setting
    const html = h("span.discourse-tag.bullet", tag.text);
    return html;
  },

  html(attrs) {
    const contents = [];

    contents.push(this.getTagTitle(attrs));
    return contents;
  },

  click() {
    DiscourseURL.routeTo(`/tag/${this.attrs.id}`);
  },
});
