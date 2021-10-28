const { React, i18n: { Messages } } = require('powercord/webpack');
const { getModule } = require('powercord/webpack');
const { inject } = require('powercord/injector');
const { findInReactTree } = require('powercord/util');

const { InjectionIDs } = require('../Constants');
const contextAction = require('../utils/contextActions');
const helper = require('../utils/helper');

/*
 * [ Context Menu ]
 * Handles the creation of new buttons in context menus relating to favorite friends
 * Contributors: Joakim#9814, Bowser65#0001, Juby210#0577
 */
module.exports = async function () {
  const { MenuItem } = await getModule([ 'MenuItem' ]);
  const settingsMgr = require('../utils/settingsMgr')(this.settings);

  for (const module of InjectionIDs.ContextMenuUser.map((id) =>
    id.replace('pd-', '')
  )) {
    const m = await helper.getDefaultModule(module);
    inject(`pd-${module}`, m, 'default', (args, res) => {
      const isUser = args[0].user !== null;
      const { id } = isUser ? args[0].user : args[0].channel;

      const group = findInReactTree(
        res,
        (c) =>
          Array.isArray(c) &&
          c.find((item) => item && item.props && item.props.id === 'block')
      );
      if (!group) {
        return res;
      }

      const currentCategory = helper.getChannelListCategory(settingsMgr, id);

      if (!currentCategory) {
        const groupList = [];
        const gListSetting = settingsMgr.get('pindms.dmCategories');

        if (gListSetting && typeof gListSetting === 'object') {
          for (const item of Object.values(gListSetting)) {
            groupList.push(
              React.createElement(MenuItem, {
                label: item.name,
                id: `${item.id}`,
                action: () => {
                  settingsMgr.push(
                    `pindms.dmCategories.${item.id}.dms`,
                    id,
                    true
                  );
                  helper.forceUpdateElement('#private-channels');
                }
              })
            );
          }
        }

        groupList.push(
          React.createElement(MenuItem, {
            label: Messages.PD_ADD_2_NEW_CATEGORY,
            id: 'pd-new-channellist',
            color: 'colorBrand',
            action: () => {
              const keys = Object.keys(
                settingsMgr.get('pindms.dmCategories') || {}
              );

              contextAction.addToNewCategoryModal(keys, id, (rndID, obj) => {
                settingsMgr.set(`pindms.dmCategories.${rndID}`, obj);
                helper.forceUpdateElement('#private-channels');
              });
            }
          })
        );

        group.push(
          React.createElement(
            MenuItem,
            {
              id: 'pd-main-item',
              label: 'PinDMs'
            },
            [
              React.createElement(
                MenuItem,
                {
                  id: 'pd-add',
                  label: Messages.PD_PIN_2_CHANNELLIST
                },
                groupList
              ),
              React.createElement(MenuItem, {
                id: 'pd-add-sever',
                label: 'Pin to server list (not yet implemented)',
                action: () => {
                  contextAction.addToServerList(settingsMgr, id, () => null);
                }
              })
            ]
          )
        );
      } else {
        group.push(
          React.createElement(MenuItem, {
            id: 'pd-remove',
            label: Messages.PD_UNPIN_FROM_CATEGORY,
            color: 'colorDanger',
            action: () => {
              if (!currentCategory && !currentCategory.id) {
                return;
              }
              let dms = settingsMgr.get(
                `pindms.dmCategories.${currentCategory.id}.dms`
              );
              if (dms && Array.isArray(dms) && dms.includes(id)) {
                dms = dms.filter((item) => item !== id);
                settingsMgr.set(
                  `pindms.dmCategories.${currentCategory.id}.dms`,
                  dms
                );
              }
              helper.forceUpdateElement('#private-channels');
            }
          })
        );
      }

      return res;
    });
    m.default.displayName = module;
  }
};
