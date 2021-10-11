const { getModule } = require("powercord/webpack");

module.exports = {
  async getDefaultModule(module) {
    return await getModule(
      (m) => m.default && m.default.displayName === module
    );
  },

  getChannelListCategory(settingsMgr, id) {
    if (!id) return null;
    const categories = settingsMgr.get("pindms.dmCategories");

    if (categories && typeof categories === "object") {
      for (const catId of Object.keys(categories)) {
        if (categories[catId].dms && categories[catId].dms.includes(id))
          return categories[catId];
      }
    }
    return null;
  },

  forceUpdateElement(el) {
    if (typeof el === "string") {
      el = document.querySelector(el);
    }
    if (!el) return;
    el.dispatchEvent(new Event("focusin"));
    el.dispatchEvent(new Event("focusout"));
  },

  _getDefaultMethodByKeyword(mdl, keyword) {
    const defaultMethod = mdl.__powercordOriginal_default ?? mdl.default;
    return typeof defaultMethod === "function"
      ? defaultMethod.toString().includes(keyword)
      : null;
  },

  async getDefaultModuleMethodByKeyword(keyword) {
    return await getModule((m) => this._getDefaultMethodByKeyword(m, keyword));
  },
};
