import * as React from 'react';

import classNames from 'classnames';
import { TranslationGetter } from '@wix/editor-elements-types';
import { ISkipToContentButtonProps } from '../SkipToContentButton.types';
import style from './style/SkipToContentButton.st.scss';
import {
  A11Y_BUTTON_LABEL_TRANS_FEATURE,
  A11Y_BUTTON_LABEL_TRANS_KEY,
  A11Y_BUTTON_LABEL_TRANS_DEFAULT_VAL,
} from './constants';

const getButtonLabel = (translate: TranslationGetter | undefined) => {
  return translate
    ? translate(
        A11Y_BUTTON_LABEL_TRANS_FEATURE,
        A11Y_BUTTON_LABEL_TRANS_KEY,
        A11Y_BUTTON_LABEL_TRANS_DEFAULT_VAL,
      )
    : A11Y_BUTTON_LABEL_TRANS_DEFAULT_VAL;
};

const SkipToContentButton: React.FC<ISkipToContentButtonProps> = props => {
  const { id, translate } = props;

  const scrollToMain = () => {
    const mainEl = document.getElementById('PAGES_CONTAINER');
    // There will always be a PAGES_CONTAINER element
    mainEl!.focus();
  };

  const buttonLabel = getButtonLabel(translate);

  return (
    <button
      id={id}
      key={id}
      className={classNames(style.skipToContentButton, 'has-custom-focus')}
      tabIndex={0}
      onClick={scrollToMain}
    >
      {buttonLabel}
    </button>
  );
};

export default SkipToContentButton;
