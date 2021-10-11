const { React } = require("powercord/webpack");
const { getModule, getModuleByDisplayName } = require("powercord/webpack");
const {
  SwitchItem,
  TextInput,
  Category,
  FormItem,
} = require("powercord/components/settings");
const {
  Button,
  settings: { ColorPickerInput },
} = require("powercord/components");
const { Sounds } = require("./Constants");

module.exports = class Settings extends React.Component {
  constructor(props) {
    super(props);

    const get = props.getSetting;
    this.plugin = powercord.pluginManager.get("powercord-pindms");

    this.state = {
      friendList: get("friendList", {}),
      notifsounds: get("notifsounds", {}),

      openCat: {
        friendList: false,
        notificationSound: false,
        pinCategories: false,
      },
    };
  }

  async componentDidMount() {
    this.setState({
      Text: await getModuleByDisplayName("Text"),
      playSound: (await getModule(["playSound"])).playSound,
      ColorUtils: await getModule(["isValidHex"]),
    });
  }

  render() {
    if (!this.state.Text) {
      return null;
    }
    const { Text, playSound, ColorUtils } = this.state;

    const dmCategories = Object.values(
      this.props.getSetting("pindms.dmCategories")
    );
    return (
      <div>
        <Category
          name="Friend list"
          opened={this.state.openCat.friendList}
          onChange={() =>
            this.setState({
              openCat: {
                ...this.state.openCat,
                friendList: !this.state.openCat.friendList,
              },
            })
          }
        >
          <SwitchItem
            note="Toggles the functionality of the information button within the DM list on favorited friends"
            style={{ marginTop: "16px" }}
            value={this.state.friendList.infomodal}
            onChange={(value) => {
              this._set("friendList.infomodal", value);
              this.plugin.reload("InformationModal");
            }}
          >
            Information Modal
          </SwitchItem>

          <SwitchItem
            note="Have sort options in the friend list"
            value={this.state.friendList.sortoptions}
            onChange={(value) => {
              this._set("friendList.sortoptions", value);
              this.plugin.reload("FriendsList");
            }}
          >
            Show sort options
          </SwitchItem>

          <SwitchItem
            note="Show mutual guilds in the friend list"
            value={this.state.friendList.mutualguilds}
            onChange={(value) => {
              this._set("friendList.mutualguilds", value);
              this.plugin.reload("FriendsList");
            }}
          >
            Show mutual guilds
          </SwitchItem>

          <SwitchItem
            note="Show total amount for all/requested/blocked"
            value={this.state.friendList.showtotal}
            onChange={(value) => {
              this._set("friendList.showtotal", value);
              this.plugin.reload("FriendsList");
            }}
          >
            Show total amount for all/requested/blocked
          </SwitchItem>
        </Category>

        <Category
          name="Notification sound"
          opened={this.state.openCat.notificationSound}
          onChange={() =>
            this.setState({
              openCat: {
                ...this.state.openCat,
                notificationSound: !this.state.openCat.notificationSound,
              },
            })
          }
        >
          <h5 className="h5-18_1nd title-3sZWYQ size12-3R0845 height16-2Lv3qA weightSemiBold-NJexzi marginBottom8-AtZOdT marginTop40-i-78cZ">
            Notification Sounds
          </h5>
          <div className="description-3_Ncsb formText-3fs7AJ marginBottom20-32qID7 modeDefault-3a2Ph1 primary-jw0I4K">
            Customize notification sounds specifically for favorited friends.
            You can put a link to an MP3 file in the textbox, or leave it blank
            to play the default sound
          </div>
          {Object.keys(Sounds).map((sound) => (
            <div
              className="pd-notification-sounds"
              style={{ marginBottom: "16px" }}
            >
              <div style={{ float: "left" }}>
                <Text className="title-31JmR4 titleDefault-a8-ZSr medium-zmzTW- size16-14cGz5 height20-mO2eIN">
                  <label className="title-31JmR4 titleDefault-a8-ZSr medium-zmzTW- size16-14cGz5 height20-mO2eIN">
                    {Sounds[sound]}
                  </label>
                </Text>
              </div>

              <div style={{ float: "right" }}>
                <div style={{ float: "left" }}>
                  <button
                    onClick={() => playSound(sound)}
                    className="pd-notification-sounds-icon button-1Pkqso iconButton-eOTKg4 button-38aScr lookOutlined-3sRXeN colorWhite-rEQuAQ buttonSize-2Pmk-w iconButtonSize-U9SCYe grow-q77ONN"
                  />
                </div>
                <div style={{ float: "right", paddingLeft: "16px" }}>
                  <TextInput
                    onChange={(value) => {
                      this.state.notifsounds[sound] = {
                        url: value,
                        volume: 0.6,
                      };
                      this._set("notifsounds", this.state.notifsounds);
                    }}
                    className="pd-textarea-notifsounds"
                    style={{ height: "33px" }}
                    placeholder="Link to MP3 file"
                    defaultValue={
                      this.state.notifsounds[sound]
                        ? this.state.notifsounds[sound].url
                        : ""
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </Category>
        <Category
          name="Pinned Categories"
          opened={this.state.openCat.pinCategories}
          onChange={() =>
            this.setState({
              openCat: {
                ...this.state.openCat,
                pinCategories: !this.state.openCat.pinCategories,
              },
            })
          }
        >
          {dmCategories.map((c) => {
            const col = c.color ? ColorUtils.hex2int(c.color) : "";
            return (
              <div className="pd-setting-category">
                <div>
                  <TextInput
                    defaultValue={c.name}
                    placeholder="category name"
                  />
                  <Button color={Button.Colors.RED} onClick={() => {}}>
                    Remove
                  </Button>
                </div>
                <div>
                  <ColorPickerInput
                    customColor={col}
                    value={ColorUtils.hex2int("transparent")}
                    onChange={(value) => {
                      const color = ColorUtils.int2hex(value);
                      this._set(`pindms.dmCategories.${c.id}.color`, color);
                      this.plugin.reload("CategoryChannel");
                    }}
                  >
                    Color
                  </ColorPickerInput>
                </div>
              </div>
            );
          })}
          <Button color={Button.Colors.BRAND}>Add</Button>
        </Category>
      </div>
    );
  }

  _set(key, value, defaultValue = undefined) {
    if (!value && defaultValue) {
      value = defaultValue;
    }

    const arr = key.split(".");

    if (arr.length > 1) {
      const mainKey = arr.shift();
      const subKey = arr.join(".");

      const s = Object.assign({}, this.props.getSetting(mainKey));
      s[subKey] = value;
      const obj = Object.unflatten(s);

      this.props.updateSetting(mainKey, obj);
      this.setState({ [mainKey]: obj });
    } else {
      this.props.updateSetting(key, value);
      this.setState({ [key]: value });
    }
  }
};
