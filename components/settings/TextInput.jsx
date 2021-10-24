const { React, getModule } = require('powercord/webpack');
const { Flex } = require('powercord/components');

const classes = getModule([ 'container', 'editIcon' ], false);

module.exports = class TextInput extends React.PureComponent {
  constructor (props) {
    super(props);

    this.handleOnChange = (e) => {
      if (typeof props.onChange === 'function') {
        props.onChange(e.currentTarget.value);
      }
    };
  }


  render () {
    return (
      <div className={[ 'pd-text-input', classes.container, classes.hasValue, this.props.disabled && classes.disabled ].filter(Boolean).join(' ')}>
        <Flex className={classes.layout}>
          <Flex.Child className={classes.input.split(' ').splice(1).join(' ')} style={{ cursor: 'auto' }}>
            <input
              type='text'
              value={this.props.defaultValue}
              placeholder={this.props.placeholder}
              disabled={this.props.disabled}
              onChange={this.handleOnChange.bind(this)}
            />
          </Flex.Child>
        </Flex>
      </div>
    );
  }
};
