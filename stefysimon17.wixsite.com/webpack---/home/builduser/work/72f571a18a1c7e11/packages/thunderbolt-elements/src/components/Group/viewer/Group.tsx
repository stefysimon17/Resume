import React from 'react';
import { IGroupProps } from '../Group.types';
import MeshContainer from '../../../thunderbolt-core-components/MeshContainer/viewer/MeshContainer';
import styles from './styles/Group.scss';

const Group: React.FC<IGroupProps> = props => {
  const {
    id,
    meshProps,
    children,
    onClick,
    onDblClick,
    onMouseEnter,
    onMouseLeave,
  } = props;

  return (
    <div
      id={id}
      onClick={onClick}
      onDoubleClick={onDblClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={styles.root}
    >
      <MeshContainer id={id} {...meshProps}>
        {children}
      </MeshContainer>
    </div>
  );
};

export default Group;
