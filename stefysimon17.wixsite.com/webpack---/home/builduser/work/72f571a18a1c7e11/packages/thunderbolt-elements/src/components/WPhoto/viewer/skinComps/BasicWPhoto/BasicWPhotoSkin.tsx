import * as React from 'react';
import { WPhotoWrapper } from '../../WPhotoWrapper';
import Link from '../../../../Link/viewer/Link';
import { BaseWPhotoSkinProps } from '../../../WPhoto.types';
import { isEmptyObject } from '../../../../../core/commons/utils';
import { selectProperComponent, getPropsForLink } from '../../../utils';

const BasicWPhotoSkin: React.FC<BaseWPhotoSkinProps> = ({
  skinsStyle,
  id,
  link,
  imageProps,
  title,
  onClick,
  hasPlatformClickHandler = false,
  onClickBehavior,
  onDblClick,
  onMouseEnter,
  onMouseLeave,
  filterEffectSvgUrl,
}) => {
  const ImageComp = selectProperComponent(onClickBehavior);
  const isPopUp = onClickBehavior === 'zoomMode';
  const linkProps = getPropsForLink({
    onClickBehavior,
    className: skinsStyle.link,
    link,
  });

  const imageLink = isPopUp ? link : undefined;

  return (
    <WPhotoWrapper
      id={id}
      className={skinsStyle.root}
      title={title}
      onClick={onClick}
      onDblClick={onDblClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      withOnClickHandler={
        !isEmptyObject(link) || hasPlatformClickHandler || isPopUp
      }
      filterEffectSvgUrl={filterEffectSvgUrl}
    >
      <Link {...linkProps}>
        <ImageComp
          id={`img_${id}`}
          {...imageProps}
          className={skinsStyle.image}
          link={imageLink}
        />
      </Link>
    </WPhotoWrapper>
  );
};

export default BasicWPhotoSkin;
