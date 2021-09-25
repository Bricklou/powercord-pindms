const { getModule, React } = require("powercord/webpack");

module.exports = class FavoriteFriends extends React.PureComponent {
  constructor(props) {
    super(props);
    // Dirty trick to be able to update the component
    props.update = this.forceUpdate.bind(this);
  }

  render() {
    const { classes, category, count } = this.props;
    if (!classes || !category || !category.dms.length) return null;
    const { NumberBadge } = getModule(["NumberBadge"], false);

    return [
      // Header
      <h2
        className={`pd-pd-category-header ${classes.privateChannelsHeaderContainer} container-2ax-kl`}
      >
        <span className={classes.headerText}>{category.name}</span>
        <NumberBadge
          count={count}
          style={{ backgroundColor: "rgb(var(--accentcolor))", width: "16px" }}
        />
      </h2>,
    ];
  }
};
