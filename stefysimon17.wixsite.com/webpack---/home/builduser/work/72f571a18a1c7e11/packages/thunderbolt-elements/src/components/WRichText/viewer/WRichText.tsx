import classNames from 'classnames';
import * as React from 'react';

import { IWRichTextProps } from '../WRichText.types';
import { TestIds } from '../constants';
import { getQaDataAttributes } from '../../../core/commons/qaUtils';
import { getAriaAttributes } from '../../../core/commons/a11y';
import skinsStyle from './style/WRichText.scss';
import { usePopupLinkEvents } from './providers/usePopupLinkEvents';

interface ScreenReaderAffixProps {
  text: string;
  testId: string;
}

// Prefix or suffix that are only visible to screen readers
const ScreenReaderAffix: React.FC<ScreenReaderAffixProps> = ({
  text,
  testId,
}) => (
  <div className={skinsStyle.srOnly} data-testid={testId}>
    {text}
  </div>
);

const WRichText: React.FC<IWRichTextProps> = props => {
  const {
    id,
    html,
    skin = 'WRichTextSkin',
    a11y,
    isQaMode,
    fullNameCompType,
    screenReader,
    ariaAttributes,
  } = props;

  const { prefix, suffix } = screenReader || {};

  const htmlWrapperRef = React.useRef<HTMLDivElement>(null);

  usePopupLinkEvents(htmlWrapperRef, [html]);

  const skinsWithContainer: Array<IWRichTextProps['skin']> = [
    'WRichTextSkin',
    'WRichTextClickableSkin',
  ];
  const isContainerSkin = skinsWithContainer.includes(skin);
  const isInContainer = isContainerSkin || prefix || suffix;

  const WrapperElement = isInContainer ? 'div' : React.Fragment;

  const sdkEventHandlers = {
    onMouseEnter: props.onMouseEnter,
    onMouseLeave: props.onMouseLeave,
    onClick: props.onClick,
    onDoubleClick: props.onDblClick,
  };

  const rootStyles = classNames(skinsStyle[skin], {
    [skinsStyle.clickable]: props.onClick || props.onDblClick,
  });

  const wrapperAttributes = isInContainer
    ? {
        id,
        ...(isContainerSkin && {
          className: rootStyles,
          'data-testid': TestIds.richTextElement,
          ...sdkEventHandlers,
          ...a11y,
          ...getQaDataAttributes(isQaMode, fullNameCompType),
        }),
      }
    : undefined;

  const richTextAttributes = {
    id: !isInContainer ? id : undefined,
    dangerouslySetInnerHTML: { __html: html },
    ref: htmlWrapperRef,
    ...(isContainerSkin
      ? {
          className: skinsStyle.richTextContainer,
          'data-testid': TestIds.containerElement,
        }
      : {
          className: rootStyles,
          'data-testid': TestIds.richTextElement,
          ...sdkEventHandlers,
          ...a11y,
          ...getAriaAttributes(ariaAttributes),
          ...getQaDataAttributes(isQaMode, fullNameCompType),
        }),
  };

  return (
    <WrapperElement {...wrapperAttributes}>
      {prefix && (
        <ScreenReaderAffix
          text={prefix}
          testId={TestIds.screenReaderPrefixElement}
        />
      )}
      <div {...richTextAttributes} />
      {suffix && (
        <ScreenReaderAffix
          text={suffix}
          testId={TestIds.screenReaderSuffixElement}
        />
      )}
    </WrapperElement>
  );
};

export default WRichText;
