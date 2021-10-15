import * as React from 'react';
import classNames from 'classnames';
import Image from '../../Image/viewer/Image';
import { VideoProps } from '../Video.types';
import hoverBoxUtils from '../../MediaContainers/HoverBox/utils';
import styles from './style/Video.scss';

const VIDEO_CLASS_FOR_LAYOUT = 'bgVideo';
const VIDEO_POSTER_CLASS_FOR_LAYOUT = 'bgVideoposter';

const POSTER_IMAGE_QUALITY = {
  quality: {
    unsharpMask: {
      radius: 0.33,
      amount: 1.0,
      threshold: 0.0,
    },
  },
  devicePixelRatio: 1,
};

const Video: React.FC<VideoProps> = props => {
  const {
    id,
    videoRef,
    videoInfo,
    posterImageInfo,
    muted,
    preload,
    loop,
    alt,
    isVideoEnabled,
    getPlaceholder,
    extraClassName = '',
  } = props;

  // fix containerId to support hoverBox component
  videoInfo.containerId = hoverBoxUtils.getDefaultId(videoInfo.containerId)!;

  const videoInfoString = React.useMemo(
    () => JSON.stringify(videoInfo),
    [videoInfo],
  );
  const VideoPosterImage = (
    <Image
      key={`${videoInfo.videoId}_img`}
      id={`${posterImageInfo.containerId}_img`}
      className={classNames(
        styles.videoPoster,
        styles.videoPosterImg,
        VIDEO_POSTER_CLASS_FOR_LAYOUT,
      )}
      {...posterImageInfo}
      {...POSTER_IMAGE_QUALITY}
      getPlaceholder={getPlaceholder}
    />
  );

  if (!isVideoEnabled) {
    return VideoPosterImage;
  }

  return (
    // Custom element defined in: https://github.com/wix-private/santa-core/blob/master/wix-custom-elements/src/elements/wixVideo/wixVideo.js
    <wix-video
      id={id}
      data-video-info={videoInfoString}
      class={classNames(
        styles.videoContainer,
        VIDEO_CLASS_FOR_LAYOUT,
        extraClassName,
      )}
    >
      <video
        key={`${videoInfo.videoId}_video`}
        ref={videoRef}
        id={`${videoInfo.containerId}_video`}
        className={styles.video}
        role="presentation"
        crossOrigin="anonymous"
        aria-label={alt}
        playsInline={true}
        preload={preload}
        muted={muted}
        loop={loop}
        autoPlay={videoInfo.autoPlay}
        tabIndex={-1}
      />
      {VideoPosterImage}
    </wix-video>
  );
};

export default Video;
