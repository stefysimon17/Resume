import * as React from 'react';
import { IContainerProps } from '../Container.types';
import { ContainerLogic } from './shared/ContainerLogic';

// This is a default container used when no other container can be rendered
const NoSkin: React.FC<IContainerProps> = props => {
  // TODO - this is a temporary patch because TB is not passing `meshProps` for some components (SITE_PAGES)
  if (!props.meshProps) {
    console.warn(
      `Container_NoSkin.skin: Warning! meshProps are missing for component id: ${props.id}`,
    );
  }
  const patchedMeshProps = props.meshProps || {
    wedges: props.wedges || [],
    rotatedComponents: props.rotatedComponents || [],
  };
  return (
    <ContainerLogic
      meshProps={patchedMeshProps}
      {...props}
      renderSlot={({ containerChildren }) => containerChildren}
    ></ContainerLogic>
  );
};

export default NoSkin;
