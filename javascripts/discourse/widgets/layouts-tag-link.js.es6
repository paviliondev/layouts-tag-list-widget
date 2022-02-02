import DiscourseURL from 'discourse/lib/url';
import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';

createWidget('layouts-tag-link', {
  tagName: 'li.layouts-tag-link',
  buildKey: (attrs) => `layouts-tag-link-${attrs.id}`,

  buildTagItem(tag) {
    const tagStyle = this.siteSettings.tag_style;
    const tagName = 'span';
    const classNames = ['discourse-tag', tagStyle];
    const attributes = {
      'data-tag-name': `${tag.text}`,
    };
    const contents = [tag.text];

    return h(`${tagName}.${classNames.join('.')}`, attributes, contents);
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
    contents.push(this.buildTagItem(attrs));
    contents.push(this.getTagCount(attrs));
    return contents;
  },

  click() {
    DiscourseURL.routeTo(`/tag/${this.attrs.id}`);
  },
});
