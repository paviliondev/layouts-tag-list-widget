import DiscourseURL from 'discourse/lib/url';
import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';

let layouts;

// Import layouts plugin with safegaurd for when widget exists without plugin:
try {
  layouts = requirejs(
    'discourse/plugins/discourse-layouts/discourse/lib/layouts'
  );
} catch (error) {
  layouts = { createLayoutsWidget: createWidget };
  console.warn(error);
}

export default layouts.createLayoutsWidget('tag-list', {
  html(attrs) {
    const { tags, tagGroups } = attrs;
    if (tags == null || tags == undefined) return;

    const tagListItems = [];
    const tagList = [];
    tagList.push(
      h(
        'a.l-tags-header',
        {
          attributes: {
            href: '/tags',
          },
        },
        I18n.t(themePrefix('header_title'))
      )
    );

    if (tags.length == 0) {
      tagList.push(h('a.l-tag-none', I18n.t(themePrefix('no_tags'))));
      return tagList;
    }

    const tagIsHidden = (tag) => {
      const hiddenTags = settings.hidden_tags.split('|');
      if (hiddenTags.includes(tag.text)) {
        return true;
      }
    };

    console.log(tagGroups);
    tagGroups.forEach((tagGroup) => {
      tagListItems.push(h('h4', tagGroup.name));
      tagGroup.tags.forEach((tag) => {
        if (!tagIsHidden(tag)) {
          tagListItems.push(this.attach('layouts-tag-link', tag));
        }
      });
    });

    tagListItems.push(h('h4', I18n.t(themePrefix('other_tags'))));
    tags.forEach((tag) => {
      if (!tagIsHidden(tag)) {
        tagListItems.push(this.attach('layouts-tag-link', tag));
      }
    });

    tagList.push(h('ul.l-tag-items', tagListItems));
    return tagList;
  },
});

createWidget('layouts-tag-link', {
  tagName: 'li.l-tag-link',
  buildKey: (attrs) => `layouts-tag-link-${attrs.id}`,

  getTagTitle(tag) {
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
    console.log(attrs);
    contents.push(this.getTagTitle(attrs));
    // contents.push(this.getTagCount(attrs));
    return contents;
  },

  click() {
    DiscourseURL.routeTo(`/tag/${this.attrs.id}`);
  },
});
