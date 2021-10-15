import { UnpackValueTypes } from '@wix/editor-elements-types';

export const keyCodes = {
  enter: 13,
  space: 32,
  end: 35,
  home: 36,
  escape: 27,
  arrowLeft: 37,
  arrowUp: 38,
  arrowRight: 39,
  arrowDown: 40,
  tab: 9,
  delete: 46,
  a: 65,
  z: 90,
} as const;

// see: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
export const keys = {
  space: ['Spacebar', ' '],
  enter: ['Enter'],
} as const;

export type Key = 'Spacebar' | ' ' | 'Enter';

type KeyCode = UnpackValueTypes<typeof keyCodes>;

function activateByKey(key: KeyCode): React.KeyboardEventHandler<HTMLElement> {
  return event => {
    if (event.keyCode === key) {
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.click();
    }
  };
}

export const activateBySpaceButton = activateByKey(keyCodes.space);
export const activateByEnterButton = activateByKey(keyCodes.enter);
export const activateBySpaceOrEnterButton: React.KeyboardEventHandler<HTMLElement> =
  event => {
    activateByEnterButton(event);
    activateBySpaceButton(event);
  };
export const activateByEscapeButton = activateByKey(keyCodes.escape);

export const HAS_CUSTOM_FOCUS_CLASSNAME = 'has-custom-focus';

export type AriaProps = {
  pressed?: boolean;
  expanded?: boolean;
  haspopup?: 'true' | 'false' | 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid';
  tabindex?: number;
  label?: string;
  live?: 'polite' | 'assertive';
  disabled?: boolean;
  describedBy?: string;
  labeledBy?: string;
  errorMessage?: string;
};

export type AriaAttributes = Pick<
  React.AriaAttributes,
  | 'aria-pressed'
  | 'aria-haspopup'
  | 'aria-label'
  | 'aria-live'
  | 'aria-expanded'
  | 'aria-disabled'
  | 'aria-describedby'
  | 'aria-labelledby'
  | 'aria-errormessage'
> &
  Pick<React.HTMLAttributes<any>, 'tabIndex'>;

export const getAriaAttributes = ({
  pressed,
  expanded,
  haspopup,
  tabindex,
  label,
  live,
  disabled,
  describedBy,
  labeledBy,
  errorMessage,
}: AriaProps = {}): Partial<AriaAttributes> => {
  const finalAriaAttributes: Partial<AriaAttributes> = {};

  if (label) {
    finalAriaAttributes['aria-label'] = label;
  }

  if (live) {
    finalAriaAttributes['aria-live'] = live;
  }

  if (typeof pressed === 'boolean') {
    finalAriaAttributes['aria-pressed'] = pressed;
  }

  if (typeof expanded === 'boolean') {
    finalAriaAttributes['aria-expanded'] = expanded;
  }

  if (typeof disabled === 'boolean') {
    finalAriaAttributes['aria-disabled'] = disabled;
  }

  if (haspopup) {
    finalAriaAttributes['aria-haspopup'] = haspopup;
  }

  if (typeof tabindex === 'number') {
    finalAriaAttributes.tabIndex = tabindex;
  }

  if (describedBy) {
    finalAriaAttributes['aria-describedby'] = describedBy;
  }

  if (labeledBy) {
    finalAriaAttributes['aria-labelledby'] = labeledBy;
  }

  if (errorMessage) {
    finalAriaAttributes['aria-errormessage'] = errorMessage;
  }

  return finalAriaAttributes;
};
