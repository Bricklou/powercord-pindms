const {
  React,
  getModule,
  i18n: { Messages },
} = require("powercord/webpack");
const {
  Flex,
  Button,
  Card,
  Divider,
  settings: { ColorPickerInput, TextInput },
} = require("powercord/components");

const ColorUtils = getModule(["isValidHex"], false);
const classes = getModule(["card", "pulseBorder"], false);
const TextInputWithButton = require("./TextInputWithButton");

class CategoryCard extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleNameChange = (value) => {
      if (typeof props.onNameChange === "function") {
        props.onNameChange(value);
      }
    };

    this.handleColorChange = (value) => {
      if (typeof props.onColorChange === "function") {
        props.onColorChange(value);
      }
    };

    this.handleDeleteCategory = () => {
      if (typeof props.onDeleteCategory === "function") {
        props.onDeleteCategory();
      }
    };

    this.state = {
      showPicker: false,
    };
  }

  render() {
    return (
      <Flex direction={Flex.Direction.VERTICAL} className="pd-category-card">
        <Flex>
          <Flex.Child basis="70%">
            <></>
            <TextInput
              defaultValue={this.props.category.name}
              placeholder={
                Messages.PD_CATEGORIES_SETTINGS.CATEGORY_NAME_PLACEHOLDER
              }
              onChange={this.handleNameChange.bind(this)}
            />
          </Flex.Child>
          <Flex.Child basis="30%">
            <Button
              color={Button.Colors.RED}
              onClick={this.handleDeleteCategory.bind(this)}
            >
              {Messages.PD_CATEGORIES_SETTINGS.CATEGORY_REMOVE_BTN}
            </Button>
          </Flex.Child>
        </Flex>

        <Flex>
          <Flex.Child basis="70%">
            <></>
            <TextInputWithButton
              placeholder={Messages.PD_CATEGORIES_SETTINGS.COLOR_PLACEHOLDER}
              buttonText={
                !this.state.showPicker
                  ? Messages.PD_CATEGORIES_SETTINGS.OPEN_COLOR_PICKER
                  : Messages.PD_CATEGORIES_SETTINGS.CLOSE_COLOR_PICKER
              }
              buttonColor={this.props.category.color || ""}
              buttonIcon={"fas fa-palette"}
              onButtonClick={() => {
                this.setState({
                  showPicker: !this.state.showPicker,
                });
              }}
              onChange={(value) => this.updateColor(value)}
              defaultValue={this.props.category.color || ""}
            />
          </Flex.Child>
          <Flex.Child basis="30%">
            <Button onClick={() => this.resetColor()}>
              {Messages.PD_CATEGORIES_SETTINGS.RESET_COLOR}
            </Button>
          </Flex.Child>
        </Flex>
        {this.renderColorPicker()}
      </Flex>
    );
  }

  renderColorPicker() {
    if (this.state.showPicker) {
      return [
        <Divider />,
        <ColorPickerInput
          default={ColorUtils.hex2int("#8e9297")}
          value={ColorUtils.hex2int(
            this.props.category.color || "#8e9297",
            "#8e9297"
          )}
          onChange={(value) => this.updateColor(value)}
        />,
      ];
    }
  }

  updateColor(value) {
    if (ColorUtils.isValidHex(value)) {
      this.handleColorChange(value);
    } else {
      this.handleColorChange(ColorUtils.int2hex(value));
    }
  }

  resetColor() {
    this.handleColorChange();
  }
}

module.exports = React.memo((props) => (
  <Card
    editable={false}
    className={["pd-settings-card", classes.card].join(" ")}
  >
    <CategoryCard {...props} />
  </Card>
));
