const { getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

module.exports = {
  async getDefaultModule (module) {
    const mod = await getModule(
      (m) => m.default && m.default.displayName === module
    );
    return mod;
  },

  getChannelListCategory (settingsMgr, id) {
    if (!id) {
      return null;
    }
    const categories = settingsMgr.get('pindms.dmCategories');

    if (categories && typeof categories === 'object') {
      for (const catId of Object.keys(categories)) {
        if (categories[catId].dms && categories[catId].dms.includes(id)) {
          return categories[catId];
        }
      }
    }
    return null;
  },

  forceUpdateElement (el) {
    return new Promise((resolve) => {
      if (typeof el === 'string') {
        el = document.querySelector(el);
      }
      if (!el) {
        return;
      }
      el.dispatchEvent(new Event('focusin'));

      setTimeout(() => {
        el.dispatchEvent(new Event('focusout'));
        resolve();
      }, 10);
    });
  },

  _getDefaultMethodByKeyword (mdl, keyword) {
    const defaultMethod = mdl.__powercordOriginal_default ?? mdl.default;
    return typeof defaultMethod === 'function'
      ? defaultMethod.toString().includes(keyword)
      : null;
  },

  async getDefaultModuleMethodByKeyword (keyword) {
    const mod = await getModule((m) => this._getDefaultMethodByKeyword(m, keyword));
    return mod;
  },

  debounce (func, timeout = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), timeout);
    };
  },
  // thanks jooby and xinos https://github.com/Juby210/view-raw/blob/master/index.js#L100-L124
  async lazyPatchContextMenu(displayName, patch) {
    const filter = m => m.default && m.default.displayName === displayName
    const m = getModule(filter, false)
    if (m) patch(m)
    else {
      const module = getModule([ 'openContextMenuLazy' ], false)
      const ran = Math.random().toPrecision(4).replace('0.', '')
      inject(`pindms-lazy-menu-${ran}`, module, 'openContextMenuLazy', args => {
        const lazyRender = args[1]
        args[1] = async () => {
          const render = await lazyRender(args[0])
  
          return (config) => {
            const menu = render(config)
            if (menu?.type?.displayName === displayName && patch) {
              uninject(`pindms-lazy-menu-${ran}`)
              patch(getModule(filter, false))
              patch = false
            }
            return menu
          }
        }
        return args
      }, true)
    }
  }
};
