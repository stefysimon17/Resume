import * as React from 'react';
import classNames from 'classnames';
import {
  IElementPropsSDKActions,
  IClickPropsSDKActions,
} from '../../../core/corvid/props-factories';
import styles from './WPhotoWrapper.scss';

type WPhotoWrapperProps = {
  id: string;
  className: string;
  title?: string;
  withOnClickHandler: boolean;
  filterEffectSvgUrl?: string;
} & Partial<IElementPropsSDKActions> &
  Partial<IClickPropsSDKActions>;

export const WPhotoWrapper: React.FC<WPhotoWrapperProps> = props => {
  const {
    id,
    children,
    className,
    title,
    onClick,
    onDblClick,
    withOnClickHandler,
    onMouseEnter,
    onMouseLeave,
    filterEffectSvgUrl,
  } = props;
  const withOnClickHandlerClass = withOnClickHandler
    ? styles.withOnClickHandler
    : '';

  const inlineStyle = filterEffectSvgUrl
    ? {
        style: {
          '--filter-effect-svg-url': filterEffectSvgUrl,
        } as React.CSSProperties,
      }
    : {};

  return (
    <div
      id={id}
      className={classNames(className, withOnClickHandlerClass)}
      title={title}
      onClick={onClick}
      onDoubleClick={onDblClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...inlineStyle}
    >
      {children}
    </div>
  );
};
