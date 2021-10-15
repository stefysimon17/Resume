import * as React from 'react';
import { AnchorProps } from '../Anchor.types';
import styles from './Anchor.scss';

const Anchor: React.FC<AnchorProps> = props => {
  const { id, name } = props;
  /**
   * .ignore-focus className has no docs and is part of the a11y focus ring feature. Implementation is made on TB:
     https://github.com/wix-private/thunderbolt/blob/master/packages/thunderbolt-becky/src/carmi/css.carmi.ts#L154

   * Adds to #siteContainer a css rule that adds box-shadow if child element is focused() and doesn't have the classes
     .has-custom-focus OR .ignore-focus
   */
  return (
    <div
      id={id}
      className={`${styles.root} ignore-focus`}
      tabIndex={-1}
      role="region"
      aria-label={name}
    >
      &nbsp;
    </div>
  );
};

export default Anchor;
