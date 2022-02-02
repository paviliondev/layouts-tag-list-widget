import { ajax } from 'discourse/lib/ajax';
import { isHidden, sortTags } from '../lib/widget-helpers';

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
      // If site is using Tag Groups:
      let rawTagGroups;
      let tagGroups;

      if (siteSettings.tags_listed_by_group) {
        rawTagGroups = tagList.extras.tag_groups;
        tagGroups = rawTagGroups.filter((tagGroup) => {
          tagGroup['tags'] = tagGroup.tags.filter((tag) => {
            return !isHidden(tag.text, settings.hidden_tags);
          });
          sortTags(tagGroup.tags);
          return !isHidden(tagGroup.name, settings.hidden_tag_groups);
        });
      } else {
        rawTagGroups = null;
        tagGroups = null;
      }

      // If site is not using Tag Groups:
      const rawTags = tagList.tags;
      const tags = rawTags.filter((tag) => {
        return !isHidden(tag.text, settings.hidden_tags);
      });
      sortTags(tags);

      const props = {
        tags,
        tagGroups,
        siteSettings,
      };
      layouts.addSidebarProps(props);
    });
  },
};
