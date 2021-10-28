module.exports = {
  Statuses: {
    online: {
      friendly: 'online',
      class: 'online-2S838R'
    },
    idle: {
      friendly: 'idle',
      class: 'idle-3DEnRT'
    },
    dnd: {
      friendly: 'on do not disturb',
      class: 'dnd-1_xrcq'
    },
    offline: {
      friendly: 'offline',
      class: 'offline-3qoTek'
    }
  },
  InjectionIDs: {
    ContextMenuUser: [
      'pd-DMUserContextMenu',
      'pd-GroupDMUserContextMenu',
      'pd-GuildChannelUserContextMenu'
    ],
    ContextMenuGroup: [ 'pd-GroupDMContextMenu' ],
    CategoryChannel: [
      'pd-direct-messages',
      'pd-direct-messages-channel',
      'pd-direct-messages-mount'
    ],
    FavoriteFriendsSection: [ 'pd-favorite-friends-tabbar' ],
    StatusPopup: [ 'pd-user' ],
    ChannelTypingIntegration: [ 'pd-ct-integration' ],
    SpotifyIntegration: [ 'pd-spotify-integration', 'pd-spotify-integration2' ],
    NotificationSounds: [ 'pd-notification', 'pd-playSound' ],
    FriendsList: [
      'pd-friendslist-tabbar',
      'pd-friendslist-row',
      'pd-friendslist'
    ]
  },
  Sounds: {
    message1: 'Message',
    call_ringing: 'Incoming Call',
    user_join: 'User Joining Voice Channel'
  }
};
