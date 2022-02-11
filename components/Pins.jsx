const {
  getModule,
  React,
  constants: { Routes },
  FluxDispatcher,
  contextMenu,
} = require("powercord/webpack");
const { Tooltip } = require("powercord/components");
const settingsMgr = require("../utils/settingsMgr");
const contextAction = require("../utils/contextActions");

module.exports = class Pins extends React.PureComponent {
  serverlistUpdate(e) {
    this.props.userIds = e.userIds;
    this.forceUpdate();
  }

  componentDidMount() {
    this.serverlistUpdate = this.serverlistUpdate.bind(this);
    FluxDispatcher.subscribe("PDM_SERVERLIST_ADD", this.serverlistUpdate);
    FluxDispatcher.subscribe("PDM_SERVERLIST_REMOVE", this.serverlistUpdate);
  }

  componentWillUnmount() {
    FluxDispatcher.unsubscribe("PDM_SERVERLIST_ADD", this.serverlistUpdate);
    FluxDispatcher.unsubscribe("PDM_SERVERLIST_REMOVE", this.serverlistUpdate);
  }

  render() {
    return this.props.userIds.map((id) => (
      <Pin userId={id} settings={this.props.settings} />
    ));
  }
};

class Pin extends React.PureComponent {
  constructor(props) {
    super(props);

    this.statusChange = this.statusChange.bind(this);
    this.state = {
      firstRender: true,
    };
  }

  statusChange(e) {
    e.user?.id === this.props.userId && this.forceUpdate();
  }

  componentDidMount() {
    FluxDispatcher.subscribe("PRESENCE_UPDATE", this.statusChange);
  }

  componentWillUnmount() {
    FluxDispatcher.unsubscribe("PRESENCE_UPDATE", this.statusChange);
  }

  render() {
    if (this.state.firstRender) {
      setTimeout(() => this.setState({ firstRender: false }));
      return null;
    }
    const { userId } = this.props;
    const { default: PrivateChannel } = getModule(["DirectMessage"], false);
    const { getUser } = getModule(["getUser", "findByTag"], false);
    const { isMobileOnline, getStatus } = getModule(["isMobileOnline"], false);
    const { isTyping } = getModule(["isTyping"], false);
    const { transitionTo } = getModule(["transitionTo"], false);
    const { getDMFromUserId, getChannel } = getModule(
      ["getDMFromUserId"],
      false
    );

    const user = getUser(userId);
    const channel = getChannel(getDMFromUserId(userId) || userId);

    const avatar = PrivateChannel.prototype.renderAvatar.call({
      props: {
        channel,
        user,
        isMobile: isMobileOnline(userId),
        status: getStatus(userId),
        isTyping: isTyping(getDMFromUserId(userId), userId),
      },
    });
    avatar.props.src = avatar.props.src.replace("size=32", "size=64");

    return (
      <Tooltip
        text={
          channel.type === 3 ? channel.name : channel.rawRecipients[0].username
        }
        position="left"
      >
        <div
          onContextMenu={(e) =>
            contextMenu.openContextMenu(e, () =>
              contextAction.setupContextMenu(
                settingsMgr(this.props.settings),
                channel
              )
            )
          }
          onClick={() => transitionTo(Routes.CHANNEL("@me", channel.id))}
          className="pd-guildpin"
        >
          {avatar}
        </div>
      </Tooltip>
    );
  }
}
