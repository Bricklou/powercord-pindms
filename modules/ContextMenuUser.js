const { React } = require("powercord/webpack");
const { getModule } = require("powercord/webpack");
const { inject } = require("powercord/injector");
const { findInReactTree } = require("powercord/util");

const { InjectionIDs } = require("../Constants");
const contextAction = require("../utils/contextActions");
const helper = require("../utils/helper");

function setupSettings(settingsMgr) {
  if (!settingsMgr.has("dmCategories.friends")) {
    settingsMgr.set("dmCategories.friends", {
      id: "friends",
      name: "Friends",
      dms: [],
    });
  }

  if (!settingsMgr.has("dmCategories.blocked")) {
    settingsMgr.set("dmCategories.blocked", {
      id: "blocked",
      name: "Blocked",
      dms: [],
    });
  }

  if (!settingsMgr.has("dmCategories.groups")) {
    settingsMgr.set("dmCategories.groups", {
      id: "groups",
      name: "Groups",
      dms: [],
    });
  }
}

/*
 * [ Context Menu ]
 * Handles the creation of new buttons in context menus relating to favorite friends
 * Contributors: Joakim#9814, Bowser65#0001, Juby210#0577
 */
module.exports = async function () {
  const { MenuItem } = await getModule(["MenuItem"]);
  const settingsMgr = require("../utils/settingsMgr")(this.settings);

  setupSettings(settingsMgr);

  for (const module of InjectionIDs.ContextMenuUser.map((id) =>
    id.replace("pd-", "")
  )) {
    const m = await helper.getDefaultModule(module);
    inject(`pd-${module}`, m, "default", (args, res) => {
      const isUser = args[0].user !== null;
      const { id } = isUser ? args[0].user : args[0].channel;

      const group = findInReactTree(
        res,
        (c) =>
          Array.isArray(c) &&
          c.find((item) => item && item.props && item.props.id === "block")
      );
      if (!group) return res;

      const currentCategory = helper.getChannelListCategory(settingsMgr, id);

      if (!currentCategory) {
        const groupList = [];
        const gListSetting = settingsMgr.get("dmCategories");

        if (gListSetting && typeof gListSetting === "object") {
          for (const [_key, item] of Object.entries(gListSetting)) {
            if (["friends", "blocked", "groups"].includes(item.id)) continue;
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
              contextAction.addToNewCategoryModal(settingsMgr, id, () =>
                helper.forceUpdateElement("#private-channels")
              );
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
          ),
          React.createElement(MenuItem, {
            id: "pd-add-sever",
            label: "Pin to server list",
            action: () => {
              contextAction.addToServerList(settingsMgr, id, () => {});
            },
          })
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
