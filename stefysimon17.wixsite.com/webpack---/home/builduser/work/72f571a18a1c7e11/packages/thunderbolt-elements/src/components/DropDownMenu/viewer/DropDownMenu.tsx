import * as React from 'react';
import { IDropDownMenuProps } from '../DropDownMenu.types';
import MenuButton from '../../MenuButton/viewer/skinComps/OverlineMenuButtonNSkin/OverlineMenuButtonNSkin';
import OverlineMenuButton from './OverlineMenuButton';
import styles from './styles/DropDownMenu.scss';

const OverlineMenuButtonSkin: React.FC<IDropDownMenuProps> = props => {
  return <OverlineMenuButton {...props} styles={styles} Button={MenuButton} />;
};

export default OverlineMenuButtonSkin;
