const {
  React,
  getModule,
  constants: { ChannelTypes }
} = require('powercord/webpack');

const { GroupDM, DirectMessage } = getModule([ 'DirectMessage' ], false);
const { getChannel } = getModule([ 'getChannel', 'hasChannel' ], false);

module.exports = ({ channelId, selected }) => {
  const channel = getChannel(channelId);
  if (!channel) {
    return null;
  }
  if (channel.type === ChannelTypes.GROUP_DM) {
    return <GroupDM channel={channel} selected={selected} tabIndex={-1} />;
  }
  return (
    <DirectMessage channel={channel} selected={selected} tabIndex={-1} />
  );
};
