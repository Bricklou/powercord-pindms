const {
  getModule,
  React,
  React: { useState, useEffect },
  constants: { Routes },
  FluxDispatcher,
  contextMenu,
} = require("powercord/webpack");
const { Tooltip } = require("powercord/components");
const settingsMgr = require("../utils/settingsMgr");
const contextAction = require("../utils/contextActions");

const { default: PrivateChannel } = getModule(["DirectMessage"], false);
const { getUser } = getModule(["getUser", "findByTag"], false);
const typing = getModule(["isTyping"], false);
const { transitionTo } = getModule(["transitionTo"], false);
const { getDMFromUserId, getChannel } = getModule(["getDMFromUserId"], false);
const Flux = getModule(["useStateFromStores"], false);
const StatusStore = getModule(["isMobileOnline"], false);

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

function Pin(props) {
  const [firstRender, setFirstRender] = useState(false);
  const [rerender, setRerender] = useState(false);

  const forceUpdate = () => setRerender(!rerender);

  function statusChange() {
    e.user?.id === props.userId && forceUpdate();
  }

  useEffect(() => {
    FluxDispatcher.subscribe("PRESENCE_UPDATE", statusChange);

    return () => {
      FluxDispatcher.unsubscribe("PRESENCE_UPDATE", statusChange);
    };
  }, []);

  if (firstRender) {
    setTimeout(() => {
      setFirstRender(false);
    });
    return null;
  }

  const user = getUser(props.userId);
  const channel = getChannel(getDMFromUserId(props.userId) || props.userId);

  const [isMobileOnline, status] = Flux.useStateFromStoresArray(
    [StatusStore],
    () => {
      const status = StatusStore?.getStatus?.(props.userId);
      const isMobileOnline = StatusStore?.isMobileOnline?.(props.userId);

      return [isMobileOnline, status];
    }
  );

  const avatar = PrivateChannel.prototype.renderAvatar.call({
    props: {
      channel,
      user,
      isMobile: isMobileOnline,
      status,
      isTyping: typing.isTyping(getDMFromUserId(props.userId), props.userId),
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
            contextAction.setupContextMenu(settingsMgr(props.settings), channel)
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
