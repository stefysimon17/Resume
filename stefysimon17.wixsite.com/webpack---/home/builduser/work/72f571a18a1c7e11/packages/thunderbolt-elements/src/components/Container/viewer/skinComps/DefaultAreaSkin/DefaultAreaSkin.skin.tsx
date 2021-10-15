import * as React from 'react';
import { IContainerProps } from '../../../Container.types';
import { BasicContainer } from '../../shared/BasicContainer';
import styles from './DefaultAreaSkin.scss';

const DefaultAreaSkin: React.FC<IContainerProps> = props => {
  return <BasicContainer {...props} classes={styles} />;
};

export default DefaultAreaSkin;
