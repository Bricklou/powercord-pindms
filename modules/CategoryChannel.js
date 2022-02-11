const { inject } = require('powercord/injector');
const {
  Icons: { Pin },
  Tooltip,
} = require('powercord/components');
const {
  React,
  getModuleByDisplayName,
  getModule,
  contextMenu,
} = require('powercord/webpack');

const FavoriteFriends = require('../components/FavoriteFriends');
const helper = require('../utils/helper');
const Channel = require('../components/Channel');

const contextAction = require('../utils/contextActions');

/*
 * [ Friend DM Channel ]
 * Creates and populates the "Favorited Friends" section on the private channel/DMs screen
 */
module.exports = async function () {
  const settingsMgr = require('../utils/settingsMgr')(this.settings);
  const PrivateChannel = await getModuleByDisplayName('PrivateChannel');
  const ConnectedPrivateChannelsList = await helper.getDefaultModule(
    'ConnectedPrivateChannelsList'
  );
  const channelStore = await getModule([ 'getChannel', 'hasChannel' ]);
  const classes = {
    ...(await getModule([ 'channel', 'closeButton' ])),
    ...(await getModule([ 'avatar', 'muted', 'selected' ])),
    ...(await getModule([ 'privateChannelsHeaderContainer' ]))
  };
  const { lastMessageId } = getModule([ 'lastMessageId' ], false);
  const { getDMFromUserId } = getModule([ 'getDMFromUserId' ], false);

  this.categoriesInstances = [];

  // Patch PrivateChannel
  inject(
    'pd-direct-messages-channel',
    PrivateChannel.prototype,
    'render',
    function (args, res) {
      const getID = () => {
        if (this.props.channel.type === 3) {
          return this.props.channel.id;
        } else if (this.props.channel.type === 1) {
          return this.props.channel.recipients[0];
        }
        return null;
      };

      const pinMenu = contextAction.setupContextMenu(settingsMgr, this.props.channel);
      const child = res.props.children({ role: 'listitem' });
      const new_child = child;
      res.props.children = () => {
        const pin_component = React.createElement(
          Tooltip,
          { text: 'Pin',
            position: 'top',
            className: 'pd-pin' },
          React.createElement(Pin, {
            className: 'pd-pin',
            onClick: (e) => {
              contextMenu.openContextMenu(e, () => pinMenu);
            }
          })
        );

        new_child.props.children.props.children.splice(1, 0, pin_component);

        return new_child;
      }

      return res;
    }
  );

  // Patch DM list
  inject(
    'pd-direct-messages',
    ConnectedPrivateChannelsList,
    'default',
    (args, res) => {
      const dmsCategories = settingsMgr.get('pindms.dmCategories');
      const idList = [];

      for (const categories of Object.values(dmsCategories)) {
        idList.push(...categories.dms);
      }

      res.props.children.props.privateChannelIds =
        res.props.children.props.privateChannelIds.filter((c) => {
          const channel = channelStore.getChannel(c);

          return !(
            (channel.type === 3 && idList.includes(`${channel.id}`)) ||
            (channel.type === 1 && idList.includes(`${channel.recipients[0]}`))
          );
        });

      if (this.categoriesInstances) {
        for (let i = 0; i < this.categoriesInstances.length; i++) {
          if (
            !(this.categoriesInstances[i]?.props?.category?.id in dmsCategories)
          ) {
            delete this.categoriesInstances[i];
          }
        }
      }

      const categories = Object.values(dmsCategories).sort(
        (a, b) => a.pos - b.pos
      );

      for (const category of categories) {
        const instance = this.categoriesInstances.find(
          (c) => c.props.category.id === category.id
        );
        if (instance) {
          if (instance.props.update) {
            instance.props.category = category;
            instance.props.selectedChannelId = res.props.selectedChannelId;
            instance.props.count = category.dms.length;
            instance.props.update();
          }
        } else {
          if (category && category.dms.length) {
            const el = React.createElement(FavoriteFriends, {
              classes,
              category,
              count: category.dms.length,
              settingsMgr,
              key: category.id,
              onClicked: async (event, elem, expanded) =>{
                if (event.shiftKey) {
                  this.categoriesInstances.forEach(async element => {
                    if (element.props.category.id !== category.id) {
                      await element.props.setExpanded(false);
                    }
                  });
                } else {
                  await elem.setExpanded(!expanded);
                }
              }
            });

            this.categoriesInstances.push(el);
          }
        }
      }

      res.props.children.props.children = [
        ...res.props.children.props.children
      ];
      this.categoriesInstances.forEach((instance) => {
        const { category } = instance.props;
        instance.props.key = `pd-${category.id}`;

        res.props.children.props.children.push(instance);
        if (category.expanded) {
          let { dms } = category;
          dms = dms.sort(
            (a, b) => lastMessageId(getDMFromUserId(b) || b) - lastMessageId(getDMFromUserId(a) || a)
          );

          dms = dms.map((userId) =>
            React.createElement(Channel, {
              channelId: getDMFromUserId(userId) || userId,
              selected:
                (getDMFromUserId(userId) || userId) ===
                res.props.children.props.selectedChannelId,
              key: `${userId}`
            })
          );
          res.props.children.props.children.push(dms);
        } else {
          const dm = category.dms.find(
            (userId) =>
              (getDMFromUserId(userId) || userId) ===
              res.props.children.props.selectedChannelId
          );

          if (dm) {
            res.props.children.props.children.push(
              React.createElement(Channel, {
                channelId: getDMFromUserId(dm) || dm,
                selected: true,
                key: `${dm}`
              })
            );
          }
        }
      });

      res.props.children.props.children =
        res.props.children.props.children.flat(1);
      return res;
    }
  );

  helper.forceUpdateElement('.scroller-WSmht3');

  ConnectedPrivateChannelsList.default.displayName =
    'ConnectedPrivateChannelsList';
};
