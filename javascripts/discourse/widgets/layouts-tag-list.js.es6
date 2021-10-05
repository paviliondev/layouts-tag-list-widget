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
        'a.layouts-tag-list-header',
        {
          attributes: {
            href: '/tags',
          },
        },
        I18n.t(themePrefix('header_title'))
      )
    );

    if (tags.length === 0 && !tagGroups) {
      tagList.push(h('a', I18n.t(themePrefix('no_tags'))));
      return tagList;
    }

    const tagIsHidden = (tag) => {
      const hiddenTags = settings.hidden_tags.split('|');
      if (hiddenTags.includes(tag.text)) {
        return true;
      }
    };

    if (tagGroups) {
      tagGroups.forEach((tagGroup) => {
        tagListItems.push(h('h4', tagGroup.name));
        this.sortTags(tagGroup.tags);
        tagGroup.tags.forEach((tag) => {
          if (!tagIsHidden(tag)) {
            tagListItems.push(this.attach('layouts-tag-link', tag));
          }
        });
      });

      if (tags.length > 0) {
        tagListItems.push(h('h4', I18n.t(themePrefix('other_tags'))));
        tags.forEach((tag) => {
          if (!tagIsHidden(tag)) {
            tagListItems.push(this.attach('layouts-tag-link', tag));
          }
        });
      }
    } else {
      this.sortTags(tags);
      tags.forEach((tag) => {
        if (!tagIsHidden(tag)) {
          tagListItems.push(this.attach('layouts-tag-link', tag));
        }
      });
    }

    tagList.push(h('ul.layouts-tag-items', tagListItems));
    return tagList;
  },

  sortTags(tags) {
    const sortType = settings.sort_type;

    switch (sortType) {
      case 'Count Ascending':
        return tags.sort((a, b) => (a.count > b.count ? 1 : -1));
        break;
      case 'Count Descending':
        return tags.sort((a, b) => (b.count > a.count ? 1 : -1));
        break;
      case 'Alphabetical Ascending':
        return tags.sort((a, b) => (a.text > b.text ? 1 : -1));
        break;
      case 'Alphabetical Descending':
        return tags.sort((a, b) => (b.text > a.text ? 1 : -1));
        break;
      default:
        return tags.sort((a, b) => (b.count > a.count ? 1 : -1));
    }
  },
});

createWidget('layouts-tag-link', {
  tagName: 'li.layouts-tag-link',
  buildKey: (attrs) => `layouts-tag-link-${attrs.id}`,

  getTagTitle(tag) {
    const tagStyle = this.siteSettings.tag_style;
    const html = h(`span.discourse-tag.${tagStyle}`, tag.text);
    return html;
  },

  getTagCount(tag) {
    const showCount = settings.show_count;

    if (showCount) {
      const html = h('span.tag-count', `x ${tag.count.toString()}`);
      return html;
    }
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
