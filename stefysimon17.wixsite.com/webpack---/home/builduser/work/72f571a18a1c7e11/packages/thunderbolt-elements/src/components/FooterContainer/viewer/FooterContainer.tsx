import * as React from 'react';
import MeshContainer from '../../../thunderbolt-core-components/MeshContainer/viewer/MeshContainer';
import { IFooterContainerProps } from '../FooterContainer.types';

const FooterContainer: React.FC<IFooterContainerProps> = props => {
  const { id, skin: FooterContainerClass, children, meshProps } = props;

  const sdkEventHandlers = {
    onMouseEnter: props.onMouseEnter,
    onMouseLeave: props.onMouseLeave,
    onClick: props.onClick,
    onDoubleClick: props.onDblClick,
  };

  return (
    <FooterContainerClass
      wrapperProps={{ id, eventHandlers: sdkEventHandlers }}
    >
      <MeshContainer id={id} {...meshProps}>
        {children}
      </MeshContainer>
    </FooterContainerClass>
  );
};

export default FooterContainer;
