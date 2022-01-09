const {
  getModule,
  getModuleByDisplayName,
  React,
  i18n: { Messages },
  constants: { RelationshipTypes, StatusTypes }
} = require('powercord/webpack');
const { inject } = require('powercord/injector');
const { Tooltip, Icon } = require('powercord/components');
const FriendListTitle = require('../components/FriendListTitle');

module.exports = async function () {
  this.sortKey = '';
  this.sortReversed = false;
  this.searchQuery = '';

  const settingsMgr = require('../utils/settingsMgr')(this.settings);

  const _injectTabBar = async () => {
    const TabBar = (await getModuleByDisplayName('TabBar')).prototype;
    const { getRelationships } = await getModule([ 'getRelationships' ]);
    const { getStatus } = await getModule([ 'isMobileOnline' ]);
    inject('pd-friendslist-tabbar', TabBar, 'render', (_, res) => {
      if (res.props['aria-label'] !== Messages.FRIENDS) {
        return res;
      }
      const relationships = getRelationships();
      const onlineCount = Object.entries(relationships).filter(
        (r) =>
          r[1] === RelationshipTypes.FRIEND &&
          getStatus(r[0]) !== StatusTypes.OFFLINE
      ).length;
      const allCount = Object.values(relationships).filter(
        (r) => r === RelationshipTypes.FRIEND
      ).length;
      const pendingIncoming = Object.values(relationships).filter(
        (r) => r === RelationshipTypes.PENDING_INCOMING
      ).length;
      const pendingOutcoming = Object.values(relationships).filter(
        (r) => r === RelationshipTypes.PENDING_OUTGOING
      ).length;
      const blockedCount = Object.values(relationships).filter(
        (r) => r === RelationshipTypes.BLOCKED
      ).length;
      res.props.children.forEach((children) => {
        switch (children.props.id) {
          case 'ONLINE':
            children.props.children += ` - ${onlineCount}`;
            break;
          case 'ALL':
            children.props.children += ` - ${allCount}`;
            break;
          case 'PENDING':
            if (!Array.isArray(children.props.children)) {
              children.props.children = [ (children.props.children += ' - ') ];
            } else {
              children.props.children[1] = null;
            }
            children.props.children.push(
              React.createElement(Tooltip, {
                text: 'Incoming',
                position: 'bottom',
                children: React.createElement(Icon, {
                  className: 'bfl-down',
                  name: 'ArrowDropDown',
                  height: '20'
                })
              }),
              pendingIncoming,
              React.createElement(Tooltip, {
                text: 'Outgoing',
                position: 'bottom',
                children: React.createElement(Icon, {
                  className: 'bfl-down',
                  height: '20',
                  name: 'ArrowDropUp'
                })
              }),
              pendingOutcoming
            );
            break;
          case 'BLOCKED':
            children.props.children += ` - ${blockedCount}`;
            break;
        }
      });
      return res;
    });
  };

  const _injectFriendRow = async () => {
    const FriendRow = (await getModuleByDisplayName('FriendRow')).prototype;
    const { GuildIcon } = await getModule([ 'GuildIcon' ]);
    const { iconContainer } = await getModule([ 'iconContainer' ]);
    inject('pd-friendslist-row', FriendRow, 'render', (_, res) => {
      const childrenRenderer = res.props.children;
      const { mutualGuilds } = res._owner.stateNode.props;
      res.props.children = (...args) => {
        const children = childrenRenderer(...args);
        children.props.children.splice(
          1,
          0,
          React.createElement('div', {
            className: 'pd-mutualGuilds pd-container',
            onClick: console.log
          })
        );
        mutualGuilds?.forEach((guild) => {
          const Icon = React.createElement(
            Tooltip,
            {
              text: guild.name,
              position: 'top'
            },
            React.createElement(
              'div',
              { className: iconContainer },
              React.createElement(GuildIcon, {
                size: GuildIcon.Sizes.SMALL,
                guild,
                style: {
                  backgroundImage: `url("${guild.getIconURL(32, true)}")`
                }
              })
            )
          );
          if (!children.props.children[1].props.children) {
            children.props.children[1].props.children = [ Icon ];
          } else {
            children.props.children[1].props.children.unshift(Icon);
          }
        });
        return children;
      };
      return res;
    });
  };

  const _injectPeopleList = async () => {
    const statusSortOrder = {
      online: 0,
      streaming: 1,
      idle: 2,
      dnd: 3,
      offline: 4,
      invisible: 5,
      unknown: 6
    };
    const PeopleListSectionedNonLazy = await getModule(
      (m) => m.default?.displayName === 'PeopleListSectionedNonLazy'
    );
    inject(
      'pd-friendslist',
      PeopleListSectionedNonLazy,
      'default',
      (_, res) => {
        const childrenRenderer = res.props.children.props.children;
        res.props.children.props.children = (...args) => {
          const children = childrenRenderer(...args);
          const { props } = children.props.children[0].props.children[0];
          props.title = [
            React.createElement(FriendListTitle, {
              title: props.title,
              _this: this
            })
          ];

          children.props.children[0].props.children =
            children.props.children[0].props.children.map((section) => {
              if (section.props) {
                return section;
              }
              if (this.sortKey) {
                section = section.map((user) => {
                  user.statusIndex = statusSortOrder[user.props.status];
                  user.isPinned = Object.values(
                    settingsMgr.get('pindms.dmCategories')
                  ).some((cat) => cat.dms.includes(user.key));
                  return user;
                });
                if (this.sortKey === 'isPinned') {
                  section = section.filter((u) => u[this.sortKey]);
                }
                section.sort((x, y) => {
                  const xValue =
                      this.sortKey === 'statusIndex'
                        ? x[this.sortKey]
                        : x.props[this.sortKey],
                    yValue =
                      this.sortKey === 'statusIndex'
                        ? y[this.sortKey]
                        : y.props[this.sortKey];
                  return xValue < yValue ? -1 : xValue > yValue ? 1 : 0;
                });
              }
              if (this.searchQuery) {
                section = section.filter((u) =>
                  u.props.usernameLower.includes(this.searchQuery)
                );
              }
              if (this.sortReversed) {
                section.reverse();
              }
              return section;
            });
          return children;
        };
        return res;
      }
    );

    PeopleListSectionedNonLazy.default.displayName =
      'PeopleListSectionedNonLazy';
  };

  if (settingsMgr.get('friendList.sortoptions', true)) {
    _injectPeopleList();
  }
  if (settingsMgr.get('friendList.showtotal', true)) {
    _injectTabBar();
  }
  if (settingsMgr.get('friendList.mutualguilds', true)) {
    _injectFriendRow();
  }
};
