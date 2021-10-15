import * as React from 'react';
import { BackgroundMediaProps } from '../BackgroundMedia.types';
import styles from './style/BackgroundMedia.scss';

const BackgroundMedia: React.FC<BackgroundMediaProps> = props => {
  const { id, containerId, pageId, children, bgEffectName = '' } = props;

  return (
    // 	Custom element defined in: https://github.com/wix-private/santa-core/blob/master/wix-custom-elements/src/elements/wixBgMedia/wixBgMedia.js
    <wix-bg-media
      id={id}
      class={styles.mediaContainer}
      data-container-id={containerId}
      data-page-id={pageId}
      data-bg-effect-name={bgEffectName}
    >
      {children}
    </wix-bg-media>
  );
};

export default BackgroundMedia;
