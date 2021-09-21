const { getModule, React } = require("powercord/webpack");

module.exports = class FavoriteFriends extends React.PureComponent {
  constructor(props) {
    super(props);
    // Dirty trick to be able to update the component
    props.update = this.forceUpdate.bind(this);

    this.state = {
      collaped: props.category.collaped ?? true,
    };
  }

  render() {
    const { classes, category, onCollapse } = this.props;
    if (!classes || !category || !category.dms.length) return null;
    const { lastMessageId } = getModule(["lastMessageId"], false);
    const { getDMFromUserId } = getModule(["getDMFromUserId"], false);

    return [
      // Header
      <h2
        className={`pd-pd-category-header ${classes.privateChannelsHeaderContainer} container-2ax-kl`}
        onClick={() => {
          this.setState({
            collaped: !this.state.collaped,
          });
          onCollapse(this.state.collaped);
        }}
      >
        <span className={classes.headerText}>{category.name}</span>
        <svg
          className={`pd-expand-pd-category ${
            this.state.collaped ? "expanded" : "collapsed"
          }`}
          height={15}
          width={15}
          viewBox="0 0 20 20"
        >
          <path
            fill="var(--channels-default)"
            d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"
          />
        </svg>
      </h2>,

      // Items
      this.state.collaped
        ? category.dms
            .sort(
              (a, b) =>
                lastMessageId(getDMFromUserId(b)) -
                lastMessageId(getDMFromUserId(a))
            )
            .map((userId) => (
              <this.props.ConnectedPrivateChannel
                userId={userId}
                currentSelectedChannel={this.props.selectedChannelId}
              />
            ))
        : null,
    ];
  }
};
