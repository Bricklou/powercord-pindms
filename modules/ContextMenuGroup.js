const { React } = require("powercord/webpack");
const { getModule } = require("powercord/webpack");
const { inject } = require("powercord/injector");
const { findInReactTree } = require("powercord/util");

const { InjectionIDs } = require("../Constants");
const contextAction = require("../utils/contextActions");
const helper = require("../utils/helper");

/*
 * [ Context Menu ]
 * Handles the creation of new buttons in context menus relating to favorite friends
 * Contributors: Joakim#9814, Bowser65#0001, Juby210#0577
 */
module.exports = async function () {
  const { MenuItem } = await getModule(["MenuItem"]);
  const settingsMgr = require("../utils/settingsMgr")(this.settings);

  for (const module of InjectionIDs.ContextMenuGroup.map((id) =>
    id.replace("pd-", "")
  )) {
    const m = await helper.getDefaultModule(module);
    inject(`pd-${module}`, m, "default", (args, res) => {
      const { id } = args[0].channel;

      const group = findInReactTree(
        res,
        (c) =>
          Array.isArray(c) &&
          c.find(
            (item) => item && item.props && item.props.id === "change-icon"
          )
      );
      if (!group) return res;

      const currentCategory = helper.getChannelListCategory(settingsMgr, id);

      if (!currentCategory) {
        const groupList = [];
        const gListSetting = settingsMgr.get("dmCategories");

        if (gListSetting && typeof gListSetting === "object") {
          for (const [_key, item] of Object.entries(gListSetting)) {
            groupList.push(
              React.createElement(MenuItem, {
                label: item.name,
                id: `${item.id}`,
                action: () => {
                  settingsMgr.push(`dmCategories.${item.id}.dms`, id, true);
                  helper.forceUpdateElement("#private-channels");
                },
              })
            );
          }
        }

        if (settingsMgr.get("preCategories.friends.enabled", false)) {
          groupList.push(
            React.createElement(MenuItem, {
              label: "Add to Friend list",
              id: "pd-add-friend-list",
              action: () => {
                settingsMgr.push(`dmCategories.friends.dms`, id, true);
                helper.forceUpdateElement("#private-channels");
              },
            })
          );
        }

        if (settingsMgr.get("preCategories.blocked.enabled", false)) {
          groupList.push(
            React.createElement(MenuItem, {
              label: "Add to Blocked list",
              id: "pd-add-blocked-list",
              action: () => {
                settingsMgr.push(`dmCategories.blocked.dms`, id, true);
                helper.forceUpdateElement("#private-channels");
              },
            })
          );
        }

        if (settingsMgr.get("preCategories.groups.enabled", false)) {
          groupList.push(
            React.createElement(MenuItem, {
              label: "Add to Groups list",
              id: "pd-add-groups-list",
              action: () => {
                settingsMgr.push(`dmCategories.groups.dms`, id, true);
                helper.forceUpdateElement("#private-channels");
              },
            })
          );
        }

        groupList.push(
          React.createElement(MenuItem, {
            label: "Add to new Category",
            id: "pd-new-channellist",
            color: "colorBrand",
            action: () => {
              contextAction.addToNewCategoryModal(settingsMgr, id, () => {
                helper.forceUpdateElement("#private-channels");
              });
            },
          })
        );

        group.push(
          React.createElement(
            MenuItem,
            {
              id: "pd-add",
              label: "Pin to channel list",
            },
            groupList
          )
        );
      } else {
        group.push(
          React.createElement(MenuItem, {
            id: "pd-remove",
            label: "Unpin from the category",
            color: "colorDanger",
            action: () => {
              if (!currentCategory && !currentCategory.id) return;
              let dms = settingsMgr.get(
                `dmCategories.${currentCategory.id}.dms`
              );
              if (dms && Array.isArray(dms) && dms.includes(id)) {
                dms = dms.filter((item) => item !== id);
                settingsMgr.set(`dmCategories.${currentCategory.id}.dms`, dms);
              }
              helper.forceUpdateElement("#private-channels");
            },
          })
        );
      }

      return res;
    });

    m.default.displayName = module;
  }
};
