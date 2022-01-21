const { inject } = require("powercord/injector");
const { getModule, React } = require("powercord/webpack");
const Pins = require("../components/Pins");

/*
 * [Pinned Guild]
 * Pin guilds to the top of the guild list
 */
module.exports = async function () {
  const DefaultHomeButton = await getModule(["HomeButton"]);
  // Patch GuildList
  inject("pd-pinned-guild-list", DefaultHomeButton, "HomeButton", (_, res) => {
    if (!Array.isArray(res)) res = [res];
    res.push(
      React.createElement(Pins, {
        userIds: this.settings.get("pindms.serverlist", []),
        settings: this.settings,
      })
    );
    return res;
  });
};
