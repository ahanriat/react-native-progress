import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Animated,
  Easing,
} from 'react-native';

export default function withAnimation(WrappedComponent, indeterminateProgress) {
  const wrappedComponentName = WrappedComponent.displayName
    || WrappedComponent.name
    || 'Component';

  return class AnimatedComponent extends Component {
    static displayName = `withAnimation(${wrappedComponentName})`;
    static propTypes = {
      animated: PropTypes.bool,
      direction: PropTypes.oneOf(['clockwise', 'counter-clockwise']),
      indeterminate: PropTypes.bool,
      progress: PropTypes.instanceOf(Animated.Value),
    };

    static defaultProps = {
      animated: true,
      direction: 'clockwise',
      indeterminate: false,
      progress: 0,
    };

    constructor(props) {
      super(props);
      this.rotationValue = 0;
      this.state = {
        rotation: new Animated.Value(this.rotationValue),
      };
    }

    componentDidMount() {
      this.state.rotation.addListener((event) => { this.rotationValue = event.value; });
      if (this.props.indeterminate) {
        this.spin();
      }
    }

    componentWillUnmount() {
      this.state.rotation.removeAllListeners();
    }

    componentWillReceiveProps(props) {
      if (props.indeterminate !== this.props.indeterminate) {
        if (props.indeterminate) {
          this.spin();
        } else {
          Animated.spring(this.state.rotation, {
            toValue: (this.rotationValue > 0.5 ? 1 : 0),
          }).start((endState) => {
            if (endState.finished) {
              this.state.rotation.setValue(0);
            }
          });
        }
      }
    }

    spin() {
      this.state.rotation.setValue(0);
      Animated.timing(this.state.rotation, {
        toValue: this.props.direction === 'counter-clockwise' ? -1 : 1,
        duration: 1000,
        easing: Easing.linear,
        isInteraction: false,
      }).start((endState) => {
        if (endState.finished) {
          this.spin();
        }
      });
    }


    render() {
      return (
        <WrappedComponent
          {...this.props}
          progress={this.props.progress}
          rotation={this.state.rotation}
        />
      );
    }
  };
}
