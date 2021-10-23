const { React } = require('powercord/webpack');
const { Tooltip } = require('powercord/components');

module.exports = ({ className }) => (
  <Tooltip className={'pd-star-tooltip'} text="Favorited Friend" position="top">
    <div className={`${className} pd-star`}></div>
  </Tooltip>
);
