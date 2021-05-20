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

    tagList.push(
      h(
        "a.l-tags-header",
        {
          attributes: {
            href: "/tags",
          },
        },
        I18n.t(themePrefix("header_title"))
      )
    );

    if (tags.length == 0) {
      tagList.push(h("a.l-tag-none", I18n.t(themePrefix("no_tags"))));
      return tagList;
    }

    tags.forEach((tag) => {
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
    const tagStyle = this.siteSettings.tag_style;
    const html = h(`span.discourse-tag.${tagStyle}`, tag.text);
    return html;
  },

  getTagCount(tag) {
    // todo show count by setting
    // const html = h("span", toString(tag.count));
    // return html;
  },

  html(attrs) {
    const contents = [];
    contents.push(this.getTagTitle(attrs));
    contents.push(this.getTagCount(attrs));
    return contents;
  },

  click() {
    DiscourseURL.routeTo(`/tag/${this.attrs.id}`);
  },
});
