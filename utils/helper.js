const { getModule } = require("powercord/webpack");

module.exports = {
  async getDefaultModule(module) {
    return await getModule(
      (m) => m.default && m.default.displayName === module
    );
  },

  getChannelListCategory(settingsMgr, id) {
    if (!id) return null;
    const categories = settingsMgr.get("dmCategories");

    if (categories && typeof categories === "object") {
      for (const catId of Object.keys(categories)) {
        if (categories[catId].dms && categories[catId].dms.includes(id))
          return categories[catId];
      }
    }
    return null;
  },
};
