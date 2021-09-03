import { ajax } from 'discourse/lib/ajax';

export default {
  name: 'layouts-tag-list',

  initialize(container) {
    const siteSettings = container.lookup('site-settings:main');
    let layouts;
    let layoutsError;

    // Import layouts plugin with safegaurd for when widget exists without plugin:
    try {
      layouts = requirejs(
        'discourse/plugins/discourse-layouts/discourse/lib/layouts'
      );
    } catch (error) {
      layoutsError = error;
      console.warn(layoutsError);
    }

    if (layoutsError) return;

    if (!siteSettings.tagging_enabled) {
      console.warn(
        'To use this widget, please enable the site setting: tagging_enabled'
      );
    }

    ajax(`/tags.json`).then((tagList) => {
      const tags = tagList.tags;
      let tagGroups;
      if (siteSettings.tags_listed_by_group) {
        tagGroups = tagList.extras.tag_groups;
      } else {
        tagGroups = null;
      }

      const props = {
        tags,
        tagGroups,
        siteSettings,
      };
      layouts.addSidebarProps(props);
    });
  },
};
