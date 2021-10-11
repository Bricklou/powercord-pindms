const { inject } = require("powercord/injector");
const {
  getModule,
  getModuleByDisplayName,
  Flux,
  React,
} = require("powercord/webpack");

const helper = require("../utils/helper");

/*
 * [Pinned Guild]
 * Pin guilds to the top of the guild list
 */
module.exports = async function () {
  /*const { DirectMessage } = await getModule(["DirectMessage"]);
  const UnreadDMs = await helper.getDefaultModule("UnreadDMs");
  const DefaultHomeButton = await helper.getDefaultModuleMethodByKeyword(
    "showDMsOnly"
  );
  const id = 294490157657227264;

  const channelStore = await getModule(["getChannel"]);
  const { getDMFromUserId } = getModule(["getDMFromUserId"], false);

  // Patch GuildList
  inject("pd-pinned-guild-list", DefaultHomeButton, "default", (args, res) => {
    if (!Array.isArray(res)) res = [res];

    const cId = "666701818725793803";
    const _channel = channelStore.getChannel(cId);

    res.push(
      React.createElement(DirectMessage, {
        channel: _channel,
        selected: false,
        tabIndex: -1,

        audio: false,
        badge: 1,
        channelName: "Percival",
        isCurrentUserInThisDMCall: false,
        stream: false,
        unread: true,
        video: false,
      })
    );
    return res;
  });*/
};
