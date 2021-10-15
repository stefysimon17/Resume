import * as React from 'react';
import { FiveGridLineProps } from '../FiveGridLine.types';

type FiveGridLineWrapperProps = Omit<FiveGridLineProps, 'skin'> & {
  className?: string;
};

export const FiveGridLineWrapper: React.FC<FiveGridLineWrapperProps> =
  props => {
    const { id, children, className, onMouseEnter, onMouseLeave } = props;

    return (
      <div
        id={id}
        className={className}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </div>
    );
  };
