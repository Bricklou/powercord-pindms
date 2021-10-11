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
              id: "pd-main-item",
              label: "PinDMs",
            },
            [
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
                label: "Pin to server list (not yet implemented)",
                action: () => {
                  contextAction.addToServerList(settingsMgr, id, () => {});
                },
              }),
            ]
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
