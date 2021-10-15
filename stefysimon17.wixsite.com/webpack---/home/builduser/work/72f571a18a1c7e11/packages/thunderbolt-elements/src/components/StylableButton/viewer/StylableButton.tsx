import * as React from 'react';
import { ReactNode } from 'react';
import {
  IStylableButtonProps,
  IStylableButtonEventHandlers,
} from '../StylableButton.types';
import {
  activateBySpaceButton,
  activateByEnterButton,
  getAriaAttributes,
} from '../../../core/commons/a11y';
import { TestIds } from '../constants';
import Link, { isValidLink } from '../../Link/viewer/Link';
import { getQaDataAttributes } from '../../../core/commons/qaUtils';
import { classes, st } from './StylableButton.component.st.css';

const createIconFromString = (svg: string) => {
  return React.createElement('div', {
    dangerouslySetInnerHTML: {
      __html: svg || '',
    },
  });
};

const ButtonContent: React.FC<{ icon?: ReactNode; label?: string }> = ({
  label,
  icon,
}) => (
  <div className={classes.container}>
    {label && (
      <span className={classes.label} data-testid={TestIds.buttonLabel}>
        {label}
      </span>
    )}
    {icon && (
      <span className={classes.icon} aria-hidden="true">
        {icon}
      </span>
    )}
  </div>
);

const getEventHandlers = (
  {
    onClick,
    onDblClick,
    onMouseEnter,
    onMouseLeave,
  }: Partial<IStylableButtonEventHandlers>,
  isLink: boolean,
  isDisabled: boolean,
) => {
  return {
    onKeyDown: isLink ? activateBySpaceButton : activateByEnterButton,
    onClick: !isDisabled && onClick ? onClick : undefined,
    onDoubleClick: !isDisabled && onDblClick ? onDblClick : undefined,
    onMouseEnter,
    onMouseLeave,
  };
};

const StylableButton: React.FC<IStylableButtonProps> = props => {
  const {
    id,
    link,
    type = 'button',
    svgString,
    label,
    isDisabled,
    className,
    isQaMode,
    fullNameCompType,
    a11y,
    corvid,
    onClick,
    onDblClick,
    onMouseEnter,
    onMouseLeave,
    ariaAttributes,
  } = props;

  const a11yAttr = React.useMemo(
    () =>
      getAriaAttributes({
        ...ariaAttributes,
        ...a11y,
        disabled: a11y.disabled ?? isDisabled,
        label: ariaAttributes?.label ?? a11y.label ?? label,
      }),
    [a11y, label, ariaAttributes, isDisabled],
  );

  const eventHandlers = React.useMemo(
    () =>
      getEventHandlers(
        { onClick, onDblClick, onMouseLeave, onMouseEnter },
        isValidLink(link),
        isDisabled,
      ),
    [isDisabled, link, onClick, onDblClick, onMouseEnter, onMouseLeave],
  );

  const {
    hasBackgroundColor = false,
    hasBorderColor = false,
    hasBorderRadius = false,
    hasBorderWidth = false,
    hasColor = false,
  } = corvid || {};

  // TODO hasError - seems to be static in wix-ui-santa
  const rootClassName = st(
    classes.root,
    {
      error: false,
      disabled: isDisabled,
      hasBackgroundColor,
      hasBorderColor,
      hasBorderRadius,
      hasBorderWidth,
      hasColor,
    },
    className,
  );

  const icon: ReactNode = svgString ? createIconFromString(svgString) : null;

  const renderLinkedButton = () => (
    <div
      id={id}
      {...eventHandlers}
      {...getQaDataAttributes(isQaMode, fullNameCompType)}
    >
      <Link
        {...link}
        {...a11yAttr}
        href={isDisabled ? undefined : link!.href}
        className={st(rootClassName, classes.link)}
      >
        <ButtonContent label={label} icon={icon} />
      </Link>
    </div>
  );

  const renderRegularButton = () => (
    // TODO - should we reuse some Button component for unity?
    <div id={id} {...getQaDataAttributes(isQaMode, fullNameCompType)}>
      <button
        type={type}
        disabled={isDisabled}
        className={rootClassName}
        data-testid={TestIds.buttonContent}
        {...a11yAttr}
        {...eventHandlers}
      >
        <ButtonContent label={label} icon={icon} />
      </button>
    </div>
  );

  return isValidLink(link) ? renderLinkedButton() : renderRegularButton();
};

export default StylableButton;
