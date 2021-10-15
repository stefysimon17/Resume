import * as React from 'react';
import { MenuButtonProps } from '../../../MenuButton.types';
import OverlineMenuButton from './OverlineMenuButton';
import skinsStyle from './styles/OverlineMenuButtonNSkin.scss';

const OverlineMenuButtonNSkin: React.FC<MenuButtonProps> = props => {
  return (
    <OverlineMenuButton
      {...props}
      skinsStyle={skinsStyle}
      skin={'OverlineMenuButtonNSkin'}
    />
  );
};

export default OverlineMenuButtonNSkin;
