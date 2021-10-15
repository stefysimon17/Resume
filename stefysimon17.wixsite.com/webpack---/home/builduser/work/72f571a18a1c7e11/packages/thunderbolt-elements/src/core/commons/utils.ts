import { KeyboardEvent } from 'react';
import { Experiments } from '@wix/thunderbolt-symbols';
import { keyCodes } from './a11y';

export type Procedure = (...args: Array<any>) => void;

type KeyboardEventHandler = (event: KeyboardEvent) => void;

export const debounce = (fn: Procedure, ms = 0): Procedure => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: Array<any>) {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

export const throttle = (func: Procedure, ms = 0): Procedure => {
  let isThrottled = false,
    savedArgs: any;

  function wrapper(this: any, ...args: any) {
    if (isThrottled) {
      savedArgs = args;
      return;
    }

    func.apply(this, args);

    isThrottled = true;

    setTimeout(() => {
      isThrottled = false;
      if (savedArgs) {
        wrapper.apply(this, savedArgs);
        savedArgs = null;
      }
    }, ms);
  }

  return wrapper;
};

export const throttle2 = (fn: Function, wait = 0) => {
  let isCalled = false;
  return function (...args: any) {
    if (!isCalled) {
      fn(...args);
      isCalled = true;
      setTimeout(function () {
        isCalled = false;
      }, wait);
    }
  };
};

export const isBrowser = () => typeof window !== `undefined`;

export const performOnEnter = (
  fn: (event: KeyboardEvent) => void,
): KeyboardEventHandler => {
  return function (event: KeyboardEvent) {
    if (event.keyCode === keyCodes.enter) {
      fn(event);
    }
  };
};

export const isCSSMaskSupported = () => {
  if (!isBrowser()) {
    return true;
  }

  return (
    window.CSS &&
    window.CSS.supports(
      '(mask-repeat: no-repeat) or (-webkit-mask-repeat: no-repeat)',
    )
  );
};

export const isEmptyObject = (obj: any) =>
  !obj || (Object.keys(obj).length === 0 && obj.constructor === Object);

export type Overwrite<T, U> = Omit<T, keyof U> & U;

export const isExperimentOn = (experiments: Experiments, name: string) =>
  [true, 'new'].includes(experiments[name]);
