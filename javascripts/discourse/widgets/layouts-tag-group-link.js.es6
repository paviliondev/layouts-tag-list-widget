import { iconNode } from 'discourse-common/lib/icon-library';
import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';

createWidget('layouts-tag-group-link', {
  tagName: 'ul.layouts-tag-group',
  buildKey: (attrs) => `layouts-tag-group-link-${attrs.id}`,

  buildTitle(attrs) {
    const tagName = 'h4';
    const classNames = ['layouts-tag-group-title'];
    const attributes = {};

    return h(`${tagName}.${classNames.join('.')}`, attributes, attrs.name);
  },

  buildTogglerButton(attrs) {
    const tagName = 'button';
    const classNames = ['layouts-tag-group-toggler'];
    const attributes = {};
    let icon = 'caret-down';

    if (this.state.hideChildren) {
      icon = 'caret-right';
    }

    return h(`${tagName}.${classNames.join('.')}`, attributes, [
      iconNode(icon),
      this.buildTitle(attrs),
    ]);
  },

  defaultState() {
    return {
      hideChildren: !settings.tag_groups_default_expanded,
    };
  },

  html(attrs, state) {
    const contents = [];
    const tagGroupContents = [];
    contents.push(this.buildTogglerButton(attrs));

    if (!state.hideChildren) {
      attrs.tags.forEach((tag) => {
        tagGroupContents.push(this.attach('layouts-tag-link', tag));
      });
      contents.push(h('div.layouts-tag-group-contents', tagGroupContents));
    }

    return contents;
  },

  toggleChildren(args) {
    let hideChildren = false;

    if ([true, false].includes(args.hideChildren)) {
      this.state.hideChildren = args.hideChildren;
    }
  },

  click() {
    if (this.state.hideChildren === true) {
      this.sendWidgetAction('toggleChildren', {
        hideChildren: false,
      });
    } else {
      this.sendWidgetAction('toggleChildren', {
        hideChildren: true,
      });
    }
  },
});
