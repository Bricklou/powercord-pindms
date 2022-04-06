const {
  React,
  getModule,
  getModuleByDisplayName,
  i18n: { Messages },
} = require("powercord/webpack");
const {
  Flex,
  FormTitle,
  Button,
  settings: { SwitchItem, TextInput },
} = require("powercord/components");

const contextAction = require("../../utils/contextActions");

const TabBar = getModuleByDisplayName("TabBar", false);
//const TextInput = require('./TextInput');

const { Sounds } = require("../../Constants");
const CategoryCard = require("./CategoryCard");
const helper = require("../../utils/helper");

class Settings extends React.Component {
  constructor(props) {
    super(props);

    this.plugin = powercord.pluginManager.get("powercord-pindms");

    this.state = {
      activeColorPicker: null,
      selectedItem: "FRIENDLIST",

      friendList: props.getSetting("friendList", {}),
      notifsounds: props.getSetting("notifsounds", {}),

      playing: {},
    };
  }

  render() {
    return (
      <React.Fragment>
        {this.renderTabBar()}
        {this.renderBreadcrumb()}
        {this.renderContent()}
      </React.Fragment>
    );
  }

  renderTabBar() {
    const { tabBar, tabBarItem } = getModule(["tabBar", "tabBarItem"], false);
    const handleOnItemSelect = (selectedItem) => {
      this.setState({
        selectedItem,
        section: null,
      });
    };

    return (
      <TabBar
        className={["pd-settings-tab-bar", tabBar].filter(Boolean).join(" ")}
        selectedItem={this.state.selectedItem}
        onItemSelect={handleOnItemSelect}
        look={TabBar.Looks.BRAND}
        type={TabBar.Types.TOP}
      >
        <TabBar.Item className={tabBarItem} id="FRIENDLIST">
          {Messages.PD_FRIENDLIST}
        </TabBar.Item>
        <TabBar.Item className={tabBarItem} id="NOTIF_SOUND">
          {Messages.PD_NOTIF_SOUND}
        </TabBar.Item>
        <TabBar.Item className={tabBarItem} id="PINNED_CATEGORIES">
          {Messages.PD_PINNED_CATEGORIES}
        </TabBar.Item>
      </TabBar>
    );
  }

  renderBreadcrumb() {
    const breadcrumbClasses = getModule(
      ["breadcrumbInactive", "breadcrumbActive"],
      false
    );

    return (
      <Flex align={Flex.Align.CENTER} className={breadcrumbClasses.breadcrumbs}>
        <FormTitle tag="h1" className="pd-settings-title">
          {Messages[`PD_${this.state.selectedItem}`]}
        </FormTitle>
      </Flex>
    );
  }

  renderContent() {
    if (this.state.selectedItem === "FRIENDLIST") {
      return this.renderFriendList();
    } else if (this.state.selectedItem === "NOTIF_SOUND") {
      return this.renderNotifSound();
    } else if (this.state.selectedItem === "PINNED_CATEGORIES") {
      return this.renderPinnedCategories();
    }
  }

  renderFriendList() {
    return (
      <React.Fragment>
        <SwitchItem
          note={Messages.PD_FRIENDLIST_SETTINGS.SORT_OPTIONS_NOTE}
          value={this.state.friendList.sortoptions}
          onChange={(value) => {
            this._set("friendList.sortoptions", value);
            this.plugin.reload("FriendsList");
          }}
        >
          {Messages.PD_FRIENDLIST_SETTINGS.SORT_OPTIONS}
        </SwitchItem>

        <SwitchItem
          note={Messages.PD_FRIENDLIST_SETTINGS.MUTUAL_GUILDS_NOTE}
          value={this.state.friendList.mutualguilds}
          onChange={(value) => {
            this._set("friendList.mutualguilds", value);
            this.plugin.reload("FriendsList");
          }}
        >
          {Messages.PD_FRIENDLIST_SETTINGS.MUTUAL_GUILDS}
        </SwitchItem>

        <SwitchItem
          note={Messages.PD_FRIENDLIST_SETTINGS.SHOW_TOTAL_NOTE}
          value={this.state.friendList.showtotal}
          onChange={(value) => {
            this._set("friendList.showtotal", value);
            this.plugin.reload("FriendsList");
          }}
        >
          {Messages.PD_FRIENDLIST_SETTINGS.SHOW_TOTAL}
        </SwitchItem>
      </React.Fragment>
    );
  }

  renderNotifSound() {
    const { playSound } = getModule(["playSound"], false);
    const Text = getModuleByDisplayName("Text", false);
    const Speaker = getModuleByDisplayName("Speaker", false);

    return (
      <React.Fragment>
        <Text className="pd-notif-sound-settings-description">
          {Messages.PD_NOTIF_SOUND_SETTINGS.NOTE}
        </Text>
        <Text
          className="pd-notif-sound-settings-description"
          style={{ color: "red", "font-weight": "bold" }}
        >
          {Messages.PD_NOTIF_SOUND_SETTINGS.WARNING}
        </Text>
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
                <Button
                  onClick={() => {
                    if (
                      !this.state.notifsounds[sound] ||
                      !this.state.notifsounds[sound].url
                    ) {
                      playSound(sound);
                      return;
                    }
                    if (this.state.playing[sound]) {
                      this.state.playing[sound].pause();
                      delete this.state.playing[sound];
                    } else {
                      const player = new Audio(
                        this.state.notifsounds[sound].url
                      );
                      player.volume = this.state.notifsounds[sound]
                        ? this.state.notifsounds[sound].volume || 0.5
                        : 0.5;
                      player.play();
                      player.addEventListener("ended", () => {
                        delete this.state.playing[sound];
                      });
                      this.state.playing[sound] = player;
                    }
                  }}
                  className="pd-notification-sounds-icon"
                >
                  <Speaker></Speaker>
                </Button>
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
      </React.Fragment>
    );
  }

  renderPinnedCategories() {
    const dmCategories = Object.values(
      this.props.getSetting("pindms.dmCategories")
        ? this.props.getSetting("pindms.dmCategories")
        : {}
    );

    return (
      <React.Fragment>
        {dmCategories
          .filter((c) => !!c)
          .sort((a, b) => a.pos - b.pos)
          .map((c) => (
            <CategoryCard
              category={c}
              onNameChange={(newName) => {
                console.log(newName);
                if (
                  !newName ||
                  !this.props.getSetting(`pindms.dmCategories.${c.id}`)
                ) {
                  return;
                }
                this._set(`pindms.dmCategories.${c.id}.name`, newName);

                helper.debounce(() => {
                  this.plugin.reload("CategoryChannel");
                });
              }}
              onColorChange={(newColor) => {
                if (!newColor) {
                  this._set(`pindms.dmCategories.${c.id}.color`);
                } else {
                  this._set(`pindms.dmCategories.${c.id}.color`, newColor);
                }

                helper.debounce(() => {
                  this.plugin.reload("CategoryChannel");
                });
              }}
              onDeleteCategory={() => {
                delete dmCategories[c.id];
                this._set(`pindms.dmCategories.${c.id}`);
                this.plugin.reload("CategoryChannel");
              }}
            />
          ))}
        <Button
          color={Button.Colors.BRAND}
          onClick={() => {
            contextAction.addToNewCategoryModal(
              Object.keys(this.props.getSetting("pindms.dmCategories") || {}),
              null,
              (rndID, obj) => {
                this._set(`pindms.dmCategories.${rndID}`, obj);
                this.plugin.reload("CategoryChannel");
              }
            );
          }}
        >
          Add
        </Button>
      </React.Fragment>
    );
  }

  _set(key, value, defaultValue) {
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
}

module.exports = React.memo(Settings);
