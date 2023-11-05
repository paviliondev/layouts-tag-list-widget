import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';
import { isHidden } from '../lib/widget-helpers';

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

export default layouts.createLayoutsWidget('layouts-tag-list', {
  buildHeader() {
    const tagName = 'a';
    const classNames = ['layouts-tag-list-header'];
    const attributes = {
      href: '/tags',
    };
    const headerTitle = I18n.t(themePrefix('header_title'));

    return h(`${tagName}.${classNames.join('.')}`, attributes, headerTitle);
  },

  html(attrs) {
    const { tags, tagGroups } = attrs;

    if (tags == null || tags == undefined) return;

    const tagListItems = [];
    const contents = [];
    contents.push(this.buildHeader());

    if (tags.length === 0 && !tagGroups) {
      contents.push(h('a', I18n.t(themePrefix('no_tags'))));
      return contents;
    }

    if (tagGroups) {
      tagGroups.forEach((tagGroup) => {
        tagListItems.push(this.attach('layouts-tag-group-link', tagGroup));
      });

      // Other Tags
      if (tags.length > 0) {
        const otherTagsGroup = {
          name: I18n.t(themePrefix('other_tags')),
          tags: tags,
        };
        tagListItems.push(
          this.attach('layouts-tag-group-link', otherTagsGroup)
        );
      }
    } else {
      const tagItems = [];
      tags.forEach((tag) => {
        if (!isHidden(tag.text, settings.hidden_tags)) {
          tagItems.push(this.attach('layouts-tag-link', tag));
        }
      });
      tagListItems.push(h('div.layouts-tag-contents', tagItems));
    }

    contents.push(h('ul.layouts-tag-items', tagListItems));
    return contents;
  },
});
