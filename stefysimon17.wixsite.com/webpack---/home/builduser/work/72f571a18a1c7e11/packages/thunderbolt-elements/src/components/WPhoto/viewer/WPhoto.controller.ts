import { IComponentController } from '@wix/editor-elements-types';
import { IWPhotoControllerActions } from '../WPhoto.types';

const mapActionsToProps: IComponentController = ({
  updateProps,
}): IWPhotoControllerActions => ({
  onSizeChange: (width, height) => {
    updateProps({ width, height });
  },
});

export default mapActionsToProps;
