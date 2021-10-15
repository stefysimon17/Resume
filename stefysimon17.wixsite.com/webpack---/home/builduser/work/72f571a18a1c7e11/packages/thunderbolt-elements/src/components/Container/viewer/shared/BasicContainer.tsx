import * as React from 'react';
import { ISkinableContainerProps } from '../../Container.types';
import { ContainerLogic } from './ContainerLogic';
import { TestIds } from './constants';

/** This is a shared dom structure for similar skins */
export const BasicContainer: React.FC<ISkinableContainerProps> = ({
  classes,
  ...rest
}) => {
  return (
    <ContainerLogic
      {...rest}
      className={classes.root}
      renderSlot={({ containerChildren }) => (
        <>
          <div className={classes.bg} data-testid={TestIds.BG} />
          {containerChildren}
        </>
      )}
    />
  );
};
