import * as React from 'react';
import WPhoto from '../../WPhotoBase';
import { SkinWPhotoProps } from '../SkinWPhoto';
import { BaseWPhotoSkinProps } from '../../../WPhoto.types';
import skinsStyles from './styles/CirclePhoto.scss';
import BasicWPhotoSkin from './BasicWPhotoSkin';

const CirclePhotoSkin: React.FC<Omit<BaseWPhotoSkinProps, 'skinsStyle'>> =
  props => <BasicWPhotoSkin {...props} skinsStyle={skinsStyles} />;

const CirclePhoto: React.FC<SkinWPhotoProps> = props => (
  <WPhoto {...props} skin={CirclePhotoSkin} />
);

export default CirclePhoto;
