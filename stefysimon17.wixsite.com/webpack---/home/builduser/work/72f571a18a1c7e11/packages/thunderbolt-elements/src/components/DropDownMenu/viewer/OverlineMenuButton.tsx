import * as React from 'react';
import { IDropDownMenuProps } from '../DropDownMenu.types';
import { MenuButtonProps } from '../../MenuButton/MenuButton.types';
import DropDownMenuBase from './DropDownMenuBase';

type OverlineMenuButtonProps = IDropDownMenuProps & {
  styles: any;
  Button: React.FC<MenuButtonProps>;
};

const OverlineMenuButton: React.FC<OverlineMenuButtonProps> = props => {
  const { styles, Button, ...rest } = props;
  return <DropDownMenuBase {...rest} styles={styles} Button={Button} />;
};

export default OverlineMenuButton;
