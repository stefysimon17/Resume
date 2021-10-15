import WPhoto_CirclePhotoComponent from '@wix/thunderbolt-elements/src/components/WPhoto/viewer/skinComps/BasicWPhoto/CirclePhoto.skin';
import WPhoto_CirclePhotoController from '@wix/thunderbolt-elements/src/components/WPhoto/viewer/WPhoto.controller';


const WPhoto_CirclePhoto = {
  component: WPhoto_CirclePhotoComponent,
  controller: WPhoto_CirclePhotoController
};


export const components = {
  ['WPhoto_CirclePhoto']: WPhoto_CirclePhoto
};


// temporary export
export const version = "1.0.0"
