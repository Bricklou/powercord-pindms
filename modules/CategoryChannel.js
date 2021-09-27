const { inject } = require("powercord/injector");
const { open: openModal } = require("powercord/modal");
const {
  Icons: { Keyboard },
  Tooltip,
} = require("powercord/components");
const {
  React,
  Flux,
  getModuleByDisplayName,
  getModule,
  constants: { Routes },
} = require("powercord/webpack");

const FavoriteFriends = require("../components/FavoriteFriends");
const InformationModal = require("../components/InformationModal");
const helper = require("../utils/helper");

/*
 * [ Friend DM Channel ]
 * Creates and populates the "Favorited Friends" section on the private channel/DMs screen
 */
module.exports = async function () {
  const _this = this;
  const settingsMgr = require("../utils/settingsMgr")(this.settings);
  const PrivateChannel = await getModuleByDisplayName("PrivateChannel");
  const ConnectedPrivateChannelsList = await helper.getDefaultModule(
    "ConnectedPrivateChannelsList"
  );
  const dms = await getModule(["openPrivateChannel"]);
  const transition = await getModule(["transitionTo"]);
  const userStore = await getModule(["getUser", "getCurrentUser"]);
  const channelStore = await getModule(["getChannel", "getDMFromUserId"]);
  const activityStore = await getModule(["getPrimaryActivity"]);
  const statusStore = await getModule(["getStatus"]);
  const classes = {
    ...(await getModule(["channel", "closeButton"])),
    ...(await getModule(["avatar", "muted", "selected"])),
    ...(await getModule(["privateChannelsHeaderContainer"])),
  };
  const { lastMessageId } = getModule(["lastMessageId"], false);
  const { getDMFromUserId } = getModule(["getDMFromUserId"], false);

  this.categoriesInstances = [];

  // Patch PrivateChannel
  inject(
    "pd-direct-messages-channel",
    PrivateChannel.prototype,
    "render",
    function (args, res) {
      if (this.props.isBetterFriends) {
        res.props.children = this.props.infoModal
          ? React.createElement(
              Tooltip,
              {
                text: "User Information",
                position: "top",
              },
              React.createElement(Keyboard, {
                className: "pd-information",
                onClick: (e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const info =
                    _this.FRIEND_DATA.lastMessageID[this.props.user.id];
                  openModal(() =>
                    React.createElement(InformationModal, {
                      user: {
                        ...this.props.user,
                        isSystemUser: () => false,
                        isSystemDM: () => false,
                      },
                      channel: !info ? "nothing" : info.channel,
                      message: !info ? "nothing" : info.id,
                    })
                  );
                },
              })
            )
          : React.createElement("p");

        if (this.props.channel.id === "0" && res.props.children) {
          res.props.onMouseDown = () => void 0;
          res.props.children = React.createElement(
            "a",
            null,
            res.props.children.props.children
          );
          res.props.onClick = async () => {
            const channelId = await dms.openPrivateChannel(
              userStore.getCurrentUser().id,
              this.props.user.id
            );
            // eslint-disable-next-line new-cap
            transition.transitionTo(Routes.CHANNEL("@me", channelId));
            if (_this.favFriendsInstance)
              _this.favFriendsInstance.forceUpdate();
          };
        }
      }
      return res;
    }
  );

  // Build connected component
  const ConnectedPrivateChannel = Flux.connectStores(
    [
      userStore,
      channelStore,
      activityStore,
      statusStore,
      powercord.api.settings.store,
    ],
    ({ userId, selectedChannelId }) => {
      const entity = userStore.getUser(userId) ||
        channelStore.getChannel(userId) || {
          id: "0",
          username: "???",
          isSystemUser: () => false,
          getAvatarURL: () => null,
          isSystemDM: () => false,
        };

      let obj = {
        channel: undefined,
        channelName: "",
        infoModal: powercord.api.settings.store.getSetting(
          "pindms",
          "infomodal"
        ),
        isBetterFriends: true,
      };
      if (entity.type === 3) {
        obj.channel = entity;
        obj.selected = selectedChannelId === userId;
        obj.channelName = entity.name.length
          ? entity.name
          : entity.rawRecipients.map((r) => r.username).join(", ");
      } else {
        const channelId = channelStore.getDMFromUserId(userId);
        obj.user = entity;
        obj.selected = selectedChannelId === channelId;
        obj.channel = channelId
          ? channelStore.getChannel(channelId)
          : {
              id: "0",
              type: 1,
              isMultiUserDM: () => false,
              isSystemUser: () => false,
              isSystemDM: () => false,
              recipients: [entity.id],
              toString: () => user.username,
            };
        obj.channelName = entity.username;
        obj.isMobile = statusStore.isMobileOnline(userId);
        obj.status = statusStore.getStatus(userId);
        obj.activities = activityStore.getActivities(userId);
      }

      return obj;
    }
  )(PrivateChannel);

  // Patch DM list
  inject(
    "pd-direct-messages",
    ConnectedPrivateChannelsList,
    "default",
    (args, res) => {
      const dmsCategories = settingsMgr.get("dmCategories");
      const idList = [];

      for (const [_, categories] of Object.entries(dmsCategories)) {
        idList.push(...categories.dms);
      }

      res.props.privateChannelIds = res.props.privateChannelIds.filter((c) => {
        const channel = channelStore.getChannel(c);

        return !(
          (channel.type === 3 && idList.includes(`${channel.id}`)) ||
          (channel.type === 1 && idList.includes(`${channel.recipients[0]}`))
        );
      });

      if (this.categoriesInstances) {
        for (let i = 0; i < this.categoriesInstances.length; i++) {
          if (
            this.categoriesInstances[i] &&
            this.categoriesInstances[i].props &&
            this.categoriesInstances[i].props.category &&
            !(this.categoriesInstances[i].props.category.id in dmsCategories)
          ) {
            delete this.categoriesInstances[i];
          }
        }
      }

      for (const [_, category] of Object.entries(dmsCategories)) {
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
            this.categoriesInstances.push(
              React.createElement(FavoriteFriends, {
                classes,
                category,
                count: category.dms.length,
                onCollapse(value, _el) {
                  settingsMgr.set(
                    `dmCategories.${category.id}.collapse`,
                    value
                  );
                  _this.reload();
                },
              })
            );
          }
        }
      }

      res.props.children = [
        // Previous elements
        ...res.props.children,
      ];
      this.categoriesInstances.forEach((instance) => {
        const category = instance.props.category;
        instance.props.key = `pd-${category.id}`;

        res.props.children.push(() => instance);

        console.log(
          "val:",
          settingsMgr.get(`dmCategories.${category.id}.collapse`)
        );

        if (settingsMgr.get(`dmCategories.${category.id}.collapse`)) {
          console.log("test");
          const dms = category.dms
            .sort((a, b) => {
              return (
                lastMessageId(getDMFromUserId(b)) -
                lastMessageId(getDMFromUserId(a))
              );
            })
            .map((userId) => () => {
              return React.createElement(ConnectedPrivateChannel, {
                userId: userId,
                key: `${userId}`,
                selectedChannelId: res.props.selectedChannelId,
              });
            });

          res.props.children.push(dms);
        }
      });

      res.props.children = res.props.children.flat(1);

      return res;
    }
  );
  ConnectedPrivateChannelsList.default.displayName =
    "ConnectedPrivateChannelsList";
};
