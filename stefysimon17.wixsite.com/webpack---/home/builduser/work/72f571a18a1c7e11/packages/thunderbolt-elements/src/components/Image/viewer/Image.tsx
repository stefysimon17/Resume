import * as React from 'react';
import classNames from 'classnames';
import { ImageProps } from '../Image.types';
import hoverBoxUtils from '../../MediaContainers/HoverBox/utils';
import styles from './style/Image.scss';
import { setImagePlaceholderInSVG } from './utils';

const Image: React.FC<ImageProps> = props => {
  const {
    id,
    containerId,
    uri,
    alt,
    name,
    role,
    width,
    height,
    displayMode,
    devicePixelRatio,
    quality,
    alignType,
    hasBgScrollEffect,
    bgEffectName = '',
    focalPoint,
    upscaleMethod,
    className = '',
    filterEffectSvgString,
    maskDataElementString,
    crop,
    isZoomed,
    imageStyles = {},
    onLoad = () => {},
    onError = () => {},
    getPlaceholder,
    containerWidth,
    containerHeight,
  } = props;

  // fix containerId and id to support hoverBox component
  const fixedContainerId = hoverBoxUtils.getDefaultId(containerId);
  const fixedId = hoverBoxUtils.getDefaultId(id)!;
  let hasSsrSrc = '';

  const imageInfo = {
    containerId: fixedContainerId,
    ...(alignType && { alignType }),
    displayMode,
    imageData: {
      width,
      height,
      uri,
      name,
      displayMode,
      ...(quality && { quality }),
      ...(devicePixelRatio && { devicePixelRatio }),
      ...(focalPoint && { focalPoint }),
      ...(crop && { crop }),
      ...(upscaleMethod && { upscaleMethod }),
    },
  };

  const imagePlaceholderData = React.useRef<any>(null);

  if (!imagePlaceholderData.current) {
    if (getPlaceholder) {
      hasSsrSrc = 'true';

      imagePlaceholderData.current = getPlaceholder({
        fittingType: displayMode,
        src: {
          id: uri,
          width: imageInfo.imageData.width,
          height: imageInfo.imageData.height,
          crop: imageInfo.imageData.crop,
          name: imageInfo.imageData.name,
          focalPoint: imageInfo.imageData.focalPoint,
        },
        target: {
          width: containerWidth,
          height: containerHeight,
          alignment: alignType,
          htmlTag: maskDataElementString ? 'svg' : 'img',
        },
      });
    } else {
      // to keep an empty placeholder data
      imagePlaceholderData.current = {
        uri: undefined, // to remove src attribute completely
        css: { img: {} },
        attr: { img: {}, container: {} },
      };
    }
  }

  const placeholder = imagePlaceholderData.current;
  const src = placeholder?.uri;
  const placeholderStyle = placeholder.css?.img;

  const filterEffectSvg = filterEffectSvgString ? (
    <svg id={`svg_${id}`} className={styles.filterEffectSvg}>
      <defs dangerouslySetInnerHTML={{ __html: filterEffectSvgString }} />
    </svg>
  ) : null;

  return (
    <wix-image
      id={fixedId}
      class={classNames(styles.image, className)}
      data-image-info={JSON.stringify(imageInfo)}
      data-has-bg-scroll-effect={hasBgScrollEffect}
      data-bg-effect-name={bgEffectName}
      data-is-svg={!!maskDataElementString}
      data-is-svg-mask={!!maskDataElementString}
      data-image-zoomed={isZoomed || ''}
      data-has-ssr-src={hasSsrSrc}
      key={fixedId + isZoomed}
    >
      {filterEffectSvg}
      {maskDataElementString ? (
        <div
          className={styles.shapeCrop}
          style={placeholderStyle}
          dangerouslySetInnerHTML={{
            __html: setImagePlaceholderInSVG(
              maskDataElementString,
              src,
              placeholder.attr,
            ),
          }}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          role={role}
          style={{ ...placeholderStyle, ...imageStyles }}
          onLoad={onLoad}
          onError={onError}
        />
      )}
    </wix-image>
  );
};

export default Image;
