import * as React from 'react';
import { IDropDownMenuProps } from '../../../DropDownMenu.types';
import DropDownMenuBase from '../../DropDownMenuBase';
import MenuButton from '../../../../MenuButton/viewer/skinComps/BaseButton/TextOnlyMenuButtonNSkin';
import styles from './TextOnlyMenuButtonSkin.scss';

const TextOnlyMenuButtonSkin: React.FC<IDropDownMenuProps> = props => {
  return <DropDownMenuBase {...props} styles={styles} Button={MenuButton} />;
};

export default TextOnlyMenuButtonSkin;
