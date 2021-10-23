const { open } = require('powercord/modal');
const NewCategoryModal = require('../components/NewCategoryModal');

function addToNewCategoryModal (keys, id, callback) {
  open(NewCategoryModal(keys, id, callback));
}

function addToServerList (settingsMgr, id, callback) {
  console.log(id);
}

module.exports = {
  addToNewCategoryModal,
  addToServerList
};
