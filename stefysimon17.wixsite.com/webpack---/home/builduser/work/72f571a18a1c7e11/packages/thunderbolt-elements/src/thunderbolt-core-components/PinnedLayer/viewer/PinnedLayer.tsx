import * as React from 'react';
import { PinnedLayerProps } from '../PinnedLayer.types';
import style from './style/PinnedLayer.scss';

const PinnedLayer: React.FC<PinnedLayerProps> = ({
  id,
  rootClassName = 'root',
  children,
}) => {
  return (
    <div id={id} className={style[rootClassName]}>
      {(children as () => React.ReactNode)()}
    </div>
  );
};

export default PinnedLayer;
