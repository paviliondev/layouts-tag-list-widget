import { createWidget } from 'discourse/widgets/widget';
import { isHidden, sortTags } from '../lib/widget-helpers';
import { ajax } from 'discourse/lib/ajax';
import RenderGlimmer from "discourse/widgets/render-glimmer";
import { hbs } from "ember-cli-htmlbars";
import { inject as service } from "@ember/service";
import { h } from 'virtual-dom';
import DiscourseURL from 'discourse/lib/url';
import { getOwner } from '@ember/application';

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
  buildKey: () => `layouts-tag-list`,

  defaultState() {
    const session = getOwner(this).lookup("session:main");
    const defaultValue = {
      loading: false,
      loaded: false,
      tags: null,
      tagGroups: null,
      siteSettings: this.siteSettings,
      settings: settings,
    };

    let tags, tagGroups;

    tags = session.get("layouts_tag_list_widget_tags")
    tagGroups = session.get("layouts_tag_list_widget_tag_groups");

    let sessionData = null;

    if (tags) {
      sessionData = {
        loading: false,
        loaded: true,
        tags: tags,
        tagGroups: tagGroups,
        siteSettings: this.siteSettings,
        settings: settings,
      }
    }

    return sessionData || defaultValue;
  },

  siteSettings: service(),

  getTags(state) {
    if (state.loading) {
      return;
    }

    state.loading = true;

    ajax(`/tags.json`).then((tagList) => {
      // If site is using Tag Groups:
      let rawTagGroups;
      let tagGroups;

      if (this.state.siteSettings.tags_listed_by_group) {
        rawTagGroups = tagList.extras.tag_groups;
        rawTagGroups = rawTagGroups.map((rawGroup) => (
          { ...rawGroup, hidden: !this.state.settings.tag_groups_default_expanded }
        ));
        tagGroups = rawTagGroups.filter((tagGroup) => {
          tagGroup['tags'] = tagGroup.tags.filter((tag) => {
            return !isHidden(tag.text, this.state.settings.hidden_tags);
          });
          sortTags(tagGroup.tags);
          return !isHidden(tagGroup.name, this.state.settings.hidden_tag_groups);
        });
      } else {
        rawTagGroups = null;
        tagGroups = null;
      }

      // If site is not using Tag Groups:
      const rawTags = tagList.tags;
      const tags = rawTags.filter((tag) => {
        return !isHidden(tag.text, state.settings.hidden_tags);
      });
      sortTags(tags);
      state.loaded = true;
      state.loading = false;
      state.tags = tags;
      state.tagGroups = tagGroups;
      const session = getOwner(this).lookup("session:main");
      session.set("layouts_tag_list_widget_tags", tags);
      session.set("layouts_tag_list_widget_tag_groups", tagGroups);
      this.scheduleRerender();
    });
  },

  html(attrs, state) {
    if (!state.loaded) {
      this.getTags(state);
    }

    if (state.loading) {
      return [h("div.spinner-container", h("div.spinner"))];
    }

    const contents = [];

    contents.push(
      new RenderGlimmer(
        this,
        "div.tag-list",
        hbs`<a href="/tags" class="layouts-tag-list-header">{{@data.headerTitle}}</a>
        {{#unless @data.tags.length}}
          <a>{{@data.noTags}}</a>
        {{else}}
          <ul class="layouts-tag-items">
            {{#if @data.tagGroups}}
              {{#each @data.tagGroups as |tagGroup|}}
                <ul class="layouts-tag-group">
                  <button class="layouts-tag-group-toggler" onClick={{action @data.onGroupButtonClick tagGroup}}>
                    {{#if tagGroup.hidden}}
                      {{d-icon "caret-right"}}
                    {{else}}
                      {{d-icon "caret-down"}}
                    {{/if}}
                    {{tagGroup.name}}
                  </button>
                  {{! Tag Group Contents }}
                  {{#unless tagGroup.hidden}}
                    <div class="layouts-tag-group-contents">
                      {{#each tagGroup.tags as |tag|}}
                        <li class="layouts-tag-link" data-tag-name="{{tag.text}}" onClick={{action @data.onTagClick tag}}>
                          <span class="discourse-tag {{@data.tagStyle}}">{{tag.text}}</span>
                          {{#if @data.showCount}}
                            <span class="tag-count">x {{tag.count}}</span>
                          {{/if}}
                        </li>
                      {{/each}}
                    </div>
                  {{/unless}}
                </ul>
              {{/each}}
            {{/if}}
          </ul>
        {{/unless}}`,
        {
          ...attrs,
          tags: state.tags,
          tagGroups: state.tagGroups,
          noTags: I18n.t(themePrefix('no_tags')),
          showCount: settings.show_count,
          tagStyle: state.siteSettings.tag_style,
          onTagClick: this.onTagClick.bind(this),
          onGroupButtonClick: this.onGroupButtonClick.bind(this),
          headerTitle: I18n.t(themePrefix('header_title')),
        }
      ),
    );
    return contents;
  },

  onTagClick(tag) {
    DiscourseURL.routeTo(`/tag/${tag.id}`);
  },

  onGroupButtonClick(group) {
    this.state.tagGroups.map((tagGroup) => {
      if (group.name === tagGroup.name) {
        tagGroup.hidden = !tagGroup.hidden;
      }
    })
    this.scheduleRerender();
  },
});
