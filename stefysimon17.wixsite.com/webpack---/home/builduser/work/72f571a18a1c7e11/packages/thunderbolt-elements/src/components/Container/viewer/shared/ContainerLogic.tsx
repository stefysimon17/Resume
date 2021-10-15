import * as React from 'react';
import { TranslationGetter } from '@wix/editor-elements-types';
import classNames from 'classnames';
import { IContainerLogicProps } from '../../Container.types';
import MeshContainer from '../../../../thunderbolt-core-components/MeshContainer/viewer/MeshContainer';
import styles from './common.scss';
import {
  ARIA_LABEL_DEFAULT,
  ARIA_LABEL_KEY,
  ARIA_LABEL_NAMESPACE,
} from './constants';

const getAriaLabel = (translate: TranslationGetter | undefined) => {
  return translate
    ? translate(ARIA_LABEL_NAMESPACE, ARIA_LABEL_KEY, ARIA_LABEL_DEFAULT)
    : ARIA_LABEL_DEFAULT;
};

export const ContainerLogic: React.FC<IContainerLogicProps> = props => {
  const {
    id,
    className,
    meshProps,
    renderSlot,
    children,
    onClick,
    onDblClick,
    onMouseEnter,
    onMouseLeave,
    translate,
    hasPlatformClickHandler,
    a11y = {},
  } = props;

  const { 'aria-label-interactions': ariaLabelInteractions, ...a11yAttr } =
    a11y;

  if (ariaLabelInteractions) {
    a11yAttr['aria-label'] = getAriaLabel(translate);
  }

  const meshContainerProps = {
    id,
    children,
    ...meshProps,
  };

  const containerClassName = classNames(className, {
    [styles.clickable]: hasPlatformClickHandler,
  });

  return (
    <div
      id={id}
      className={containerClassName}
      onClick={onClick}
      onDoubleClick={onDblClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...a11yAttr}
    >
      {renderSlot({
        containerChildren: <MeshContainer {...meshContainerProps} />,
      })}
    </div>
  );
};
