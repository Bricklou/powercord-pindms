const { Modal, open } = require("powercord/modal");
const { React } = require("powercord/webpack");
const NewCategoryModal = require("../components/NewCategoryModal");

function addToNewCategoryModal(settingsMgr, id, callback) {
  open(NewCategoryModal(settingsMgr, id, callback));
}

module.exports = {
  addToNewCategoryModal,
};
