import React from 'react';
import classnames from 'classnames';
import { SkinPageProps } from '../SkinPage';

export type BasePageSkinProps = SkinPageProps & {
  skinsStyle: { [key: string]: string };
};

const BasePageSkin: React.FC<BasePageSkinProps> = ({
  id,
  pageDidMount,
  onClick,
  onDblClick,
  children,
  skinsStyle,
  onMouseEnter,
  onMouseLeave,
}) => {
  const computedClass = classnames(skinsStyle.root, skinsStyle.pageWrapper);

  return (
    <div
      id={id}
      className={computedClass}
      ref={pageDidMount}
      onClick={onClick}
      onDoubleClick={onDblClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={skinsStyle.bg} />
      <div className={skinsStyle.inlineContent}>{children()}</div>
    </div>
  );
};

export default BasePageSkin;
