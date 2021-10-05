const { inject } = require("powercord/injector");
const { open: openModal } = require("powercord/modal");
const {
  Icons: { Keyboard, Pin },
  Tooltip,
} = require("powercord/components");
const {
  React,
  getModuleByDisplayName,
  getModule,
} = require("powercord/webpack");

const FavoriteFriends = require("../components/FavoriteFriends");
const InformationModal = require("../components/InformationModal");
const helper = require("../utils/helper");
const Channel = require("../components/Channel");

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
  const channelStore = await getModule(["getChannel", "getDMFromUserId"]);
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
      if (
        Object.values(settingsMgr.get("dmCategories")).some((cat) =>
          cat.dms.includes(this.props.user?.id)
        )
      ) {
        if (!settingsMgr.get("infomodal")) return res;
        if (!res.props.className.includes("pd-pinChannel"))
          res.props.className += " pd-pinChannel";
        res.props.children.props.onClick = () => {};
        res.props.children = [
          React.createElement(
            Tooltip,
            { text: "User information", position: "top" },
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
          ),
          res.props.children,
        ];
      } else if (
        !Object.values(settingsMgr.get("dmCategories")).some((cat) =>
          cat.dms.includes(this.props.channel?.id)
        )
      )
        res.props.children = [
          React.createElement(
            Tooltip,
            { text: "Pin", position: "top", className: "pd-pin" },
            React.createElement(Pin, {
              className: "pd-pin",
              onClick: () => {
                //do shit
              },
            })
          ),
          res.props.children,
        ];
      return res;
    }
  );

  // Patch DM list
  inject(
    "pd-direct-messages",
    ConnectedPrivateChannelsList,
    "default",
    (args, res) => {
      const dmsCategories = settingsMgr.get("dmCategories");
      const idList = [];

      const preCategories = settingsMgr.get("preCategories", {});

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
            const el = React.createElement(FavoriteFriends, {
              classes,
              category,
              count: category.dms.length,
              settingsMgr,
            });

            if (["groups", "friends", "blocked"].includes(category.id)) {
              this.categoriesInstances.unshift(el);
            } else {
              this.categoriesInstances.push(el);
            }
          }
        }
      }

      res.props.children = [...res.props.children];

      this.categoriesInstances.forEach((instance) => {
        const category = instance.props.category;
        instance.props.key = `pd-${category.id}`;

        res.props.children.push(() => instance);

        if (settingsMgr.get(`dmCategories.${category.id}.collapse`)) {
          const dms = category.dms
            .sort(
              (a, b) =>
                lastMessageId(getDMFromUserId(b)) -
                lastMessageId(getDMFromUserId(a))
            )
            .map(
              (userId) => () =>
                React.createElement(Channel, {
                  channelId: getDMFromUserId(userId) || userId,
                  selected:
                    (getDMFromUserId(userId) || userId) ===
                    res.props.selectedChannelId,
                  key: `${userId}`,
                })
            );

          res.props.children.push(dms);
        }
      });

      res.props.children = res.props.children.flat(1);

      return res;
    }
  );

  helper.forceUpdateElement("#private-channels");

  ConnectedPrivateChannelsList.default.displayName =
    "ConnectedPrivateChannelsList";
};
