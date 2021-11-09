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

    inject(
      'pd-ct-integration',
      require.cache[typingModule].exports.prototype,
      '_renderTypingElement',
      (args, res) => {
        if (
          Object.values(this.settings.get('dmCategories')).map(c => c.dms).flat(1)
            .some(fr => Object.keys(typingStore.getTypingUsers(args[0].id)).includes(fr))
        ) {
          res.props.children.props.style.filter = 'sepia(300%) hue-rotate(313deg) saturate(1600%)';
        }
        return res;
      }
    );
  } catch (e) {
    this.log(
      '"channel-typing" doesn\'t seem to be present in the plugins folder, unloading companion module'
    );
    this.unload('ChannelTypingIntegration');
  }
};
