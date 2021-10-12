const { getModule, React } = require("powercord/webpack");
const helper = require("../utils/helper");

module.exports = class FavoriteFriends extends React.PureComponent {
  constructor(props) {
    super(props);
    // Dirty trick to be able to update the component
    props.update = this.forceUpdate.bind(this);

    this.state = {
      expanded: this.props.category.expanded ?? true,
    };
  }

  render() {
    const { classes, category, count, settingsMgr } = this.props;
    if (!classes || !category || !category.dms.length || !settingsMgr)
      return null;

    return [
      // Header
      <h2
        className={`pd-pd-category-header ${classes.privateChannelsHeaderContainer} container-2ax-kl`}
        onClick={async () => {
          settingsMgr.set(
            `pindms.dmCategories.${category.id}.expanded`,
            !this.state.expanded
          );
          await helper.forceUpdateElement("#private-channels");

          this.setState({
            expanded: !this.state.expanded,
          });
        }}
      >
        <span
          className={classes.headerText}
          style={{ color: category.color ?? "var(--channels-default)" }}
        >
          {category.name} - {count}
        </span>

        <svg
          className={`dm-category-expanded-icon ${
            this.state.expanded ? "expanded" : "collapsed"
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
    ];
  }
};
