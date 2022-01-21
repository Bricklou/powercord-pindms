const { open } = require('powercord/modal');
const NewCategoryModal = require('../components/NewCategoryModal');
const { ContextMenu } = require('powercord/components');
const { FluxDispatcher, React, i18n: { Messages } } = require('powercord/webpack');
const helper = require('./helper');

function addToNewCategoryModal (keys, id, callback) {
  open(NewCategoryModal(keys, id, callback));
}

function addToServerList (settingsMgr, id) {
  settingsMgr.push('pindms.serverlist', id, true);
  FluxDispatcher.dirtyDispatch({ type: 'PDM_SERVERLIST_ADD', userIds: settingsMgr.get('pindms.serverlist') })
}

function removeFromServerList(settingsMgr, id) {
  const list = settingsMgr.get('pindms.serverlist', []).filter(i => i !== id);
  settingsMgr.set('pindms.serverlist', list);
  FluxDispatcher.dirtyDispatch({ type: 'PDM_SERVERLIST_REMOVE', userIds: list });
}

function setupContextMenu (settingsMgr, channel, rawItems = false) {
  const items = [];
  const gListSetting = settingsMgr.get('pindms.dmCategories');
  let dmID = channel.type === 3 ? channel.id : channel.type === 1 ? channel.recipients[0] : null;
  const isGuildPinned = settingsMgr.get('pindms.serverlist', []).includes(dmID);
  const currentCategory = helper.getChannelListCategory(settingsMgr, dmID);

  if (!dmID) {
    return;
  }

  if (!currentCategory)
    items.push({
      type: 'submenu',
      name: Messages.PD_PIN_2_CHANNELLIST,
      id: 'pd-add',
      getItems () {
        const items = [];
        if (gListSetting && typeof gListSetting === 'object') {
          for (const item of Object.values(gListSetting)) {
            items.push({
              type: 'button',
              name: item.name,
              id: `${item.id}`,
              onClick () {
                settingsMgr.push(`pindms.dmCategories.${item.id}.dms`, dmID, true);
                helper.forceUpdateElement('.scroller-WSmht3');
              }
            });
          }
        }
        items.push({
          type: 'button',
          name: Messages.PD_ADD_2_NEW_CATEGORY,
          id: 'pd-add-pin-shortcut',
          color: 'colorBrand',
          onClick () {
            const keys = Object.keys(settingsMgr.get('pindms.dmCategories') || {});
      
            addToNewCategoryModal(keys, dmID, (rndID, obj) => {
              settingsMgr.set(`pindms.dmCategories.${rndID}`, obj);
              helper.forceUpdateElement('.scroller-WSmht3');
            });
          }
        });
        
        return items
      }
    })
  else 
    items.push({
      type: 'button', 
      name: Messages.PD_UNPIN_FROM_CATEGORY.format({ cat: currentCategory.name }), 
      id: 'pd-remove',
      color: 'colorDanger',
      onClick () {
        const dms = settingsMgr.get(`pindms.dmCategories.${currentCategory.id}.dms`)?.filter(i => i !== dmID);
        if (!dms) return;
        settingsMgr.set(`pindms.dmCategories.${currentCategory.id}.dms`, dms);
        helper.forceUpdateElement('.scroller-WSmht3');
      }
    })

  if (!isGuildPinned) 
    items.push({
      type: 'button',
      name: 'Pin to Server List',
      id: 'pd-add-serverlist',
      onClick: () => addToServerList(settingsMgr, dmID)
    })
  else
    items.push({
      type: 'button',
      name: 'Unpin from Server List',
      id: 'pd-remove-serverlist',
      color: 'colorDanger',
      onClick: () => removeFromServerList(settingsMgr, dmID)
    })

  if (rawItems) {
    const menu = [{
      type: 'submenu',
      name: 'PinDMs',
      id: 'pd-main-item',
      getItems: () => items
    }]
    return React.createElement(ContextMenu.renderRawItems(menu)) 
  }
  const menu = React.createElement(ContextMenu, {
    itemGroups: [ items ]
  });

  const menucont = React.createElement(
    'div',
    {
      id: 'pd-add-pin-context-container'
    },
    menu
  );

  return menucont;
}

module.exports = {
  addToNewCategoryModal,
  addToServerList,
  setupContextMenu
};
