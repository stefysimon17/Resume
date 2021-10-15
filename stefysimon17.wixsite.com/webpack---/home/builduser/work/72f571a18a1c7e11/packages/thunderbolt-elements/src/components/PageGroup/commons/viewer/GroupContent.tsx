import * as React from 'react';
import { ReactElement } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { IGroupContentProps } from '../commons.types';
import Transition from '../../../Transition/Transition';

const GroupContent: React.FC<IGroupContentProps> = ({
  transition = 'none',
  transitionDuration = 0,
  transitionEnabled = true,
  onTransitionComplete = () => {},
  onTransitionStarting = () => {},
  className,
  children,
}) => {
  const childrenArray = React.Children.toArray(children());
  const child = childrenArray[0] as ReactElement;
  const childId = child?.props.id;

  const reverse = transition === 'SlideVertical';

  const content =
    transition === 'none' ? (
      children()
    ) : (
      <TransitionGroup
        className={className}
        childFactory={_child => React.cloneElement(_child, { reverse })}
      >
        <Transition
          type={transition}
          key={childId}
          timeout={transitionDuration}
          onEntered={onTransitionComplete}
          onExiting={onTransitionStarting}
          enter={transitionEnabled}
          exit={transitionEnabled}
          unmountOnExit
        >
          {() => child}
        </Transition>
      </TransitionGroup>
    );

  return <>{content}</>;
};

export default GroupContent;
