import React from 'react';
import { SkinScreenWidthContainerProps } from '../../../SkinScreenWidthContainer';
import WrapperElement from '../../WrapperElement';
import skinStyles from './styles/skins.scss';

const DefaultScreen: React.FC<SkinScreenWidthContainerProps> = ({
  wrapperProps,
  children,
}) => {
  return (
    <WrapperElement
      {...wrapperProps}
      skinClassName={skinStyles.DefaultScreen}
      skinStyles={skinStyles}
    >
      <div className={skinStyles.screenWidthBackground}>
        <div className={skinStyles.bg} />
      </div>
      <div className={skinStyles.centeredContent}>
        <div className={skinStyles.centeredContentBg}>
          <div className={skinStyles.bgCenter} />
        </div>
        <div className={skinStyles.inlineContent}>{children}</div>
      </div>
    </WrapperElement>
  );
};

export default DefaultScreen;
