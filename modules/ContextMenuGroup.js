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
  const settingsMgr = require('../utils/settingsMgr')(this.settings);

  for (const module of InjectionIDs.ContextMenuGroup.map((id) =>
    id.replace('pd-', '')
  )) {
    helper.lazyPatchContextMenu(module, m => {
      inject(`pd-${module}`, m, 'default', (args, res) => {
        const group = findInReactTree(
          res,
          (c) =>
            Array.isArray(c) &&
            c.find(
              (item) => item && item.props && item.props.id === 'change-icon'
            )
        );
        if (!group) {
          return res;
        }
        group.push(...contextAction.setupContextMenu(settingsMgr, args[0].channel, true)?.type)

        return res;
      });

      m.default.displayName = module;
    });
  }
};
