const { getModule } = require('powercord/webpack');
const { inject } = require('powercord/injector');
const { resolve } = require('path');

/*
 * [ Channel Typing Integration ]
 * Integrates new features into `channel-typing`
 * Contributors: Bowser65#0001
 */
module.exports = async function () {
  try {
    const typingModule = require.resolve(
      resolve(`${__dirname}/../../channel-typing/index.js`)
    );
    const typingStore = await getModule([ 'getTypingUsers' ]);
    const settingsMgr = require('../utils/settingsMgr')(this.settings);

    inject('pd-ct-integration', require.cache[typingModule].exports.prototype, '_renderTypingElement',
      (args, res) => {
        const savedDMs = Object.values(settingsMgr.get('pindms.dmCategories')).map(c => c.dms).flat(1);
        const typingUsers = Object.keys(typingStore.getTypingUsers(args[0].channel?.id));

        if (savedDMs.some(fr => typingUsers.includes(fr))) {
          res.props.children.props.style.filter = 'sepia(300%) hue-rotate(313deg) saturate(1600%)';
        }
        return res;
      });
  } catch (e) {
    this.log(
      '"channel-typing" doesn\'t seem to be present in the plugins folder, unloading companion module'
    );
    this.unload('ChannelTypingIntegration');
  }
};
