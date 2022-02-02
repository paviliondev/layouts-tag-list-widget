import { ajax } from 'discourse/lib/ajax';
import { isHidden } from '../lib/widget-helpers';

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
      // Fetch Data:
      const rawTags = tagList.tags;

      let rawTagGroups;
      if (siteSettings.tags_listed_by_group) {
        rawTagGroups = tagList.extras.tag_groups;
      } else {
        rawTagGroups = null;
      }

      // Filter Data:
      const tagGroups = rawTagGroups.filter((tagGroup) => {
        tagGroup['tags'] = tagGroup.tags.filter((tag) => {
          return !isHidden(tag.text, settings.hidden_tags);
        });
        return !isHidden(tagGroup.name, settings.hidden_tag_groups);
      });

      const tags = rawTags.filter((tag) => {
        return !isHidden(tag.text, settings.hidden_tags);
      });

      // Export Data:
      const props = {
        tags,
        tagGroups,
        siteSettings,
      };
      layouts.addSidebarProps(props);
    });
  },
};
