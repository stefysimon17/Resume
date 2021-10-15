import * as React from 'react';
import { IContainerProps } from '../../../Container.types';
import { BasicContainer } from '../../shared/BasicContainer';
import styles from './RectangleArea.scss';

const RectangleArea: React.FC<IContainerProps> = props => {
  return <BasicContainer {...props} classes={styles} />;
};

export default RectangleArea;
