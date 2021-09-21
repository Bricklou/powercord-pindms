const { Modal } = require("powercord/components/modal");
const { close: closeModal } = require("powercord/modal");
const { React, getModuleByDisplayName } = require("powercord/webpack");
const {
  settings: { FormItem },
  FormTitle,
  Button,
} = require("powercord/components");

const TextInput = getModuleByDisplayName("TextInput", false);

module.exports = (settingsMgr, id, callback) => {
  return class NewCategoryModal extends React.PureComponent {
    constructor(props) {
      super(props);

      this.state = {
        name: "",
      };
    }

    generateRandomId() {
      const keys = settingsMgr.getKeys("dmCategories");
      const min = Math.pow(10, 16);
      const max = Math.pow(10, 17) - 1;
      const gen = () => Math.floor(Math.random() * (max - min) + min);
      let id = gen();

      while (keys.includes(id)) {
        id = gen();
      }

      return id;
    }

    render() {
      return (
        <Modal className="pd-new-category">
          <Modal.Header>
            <FormTitle>New Category</FormTitle>
          </Modal.Header>
          <Modal.Content>
            <FormItem title="Category name:">
              <TextInput
                title="Category name"
                value={this.state.name}
                onChange={(a) => {
                  this.setState({ name: a });
                }}
              ></TextInput>
            </FormItem>
          </Modal.Content>
          <Modal.Footer>
            <Button
              color={Button.Colors.GREEN}
              disabled={this.state.name == ""}
              onClick={() => {
                const rndID = this.generateRandomId();
                settingsMgr.set(`dmCategories.${rndID}`, {
                  collapse: false,
                  dms: [id],
                  id: rndID,
                  name: this.state.name,
                  pos: settingsMgr.getLength("dmCategories") || 0,
                });
                closeModal();
                callback();
              }}
              type="submit"
            >
              Create
            </Button>
            <Button
              color={Button.Colors.TRANSPARENT}
              look={Button.Looks.LINK}
              onClick={closeModal}
            >
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      );
    }
  };
};
