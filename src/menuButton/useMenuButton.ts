import {
  KeyboardEvent,
  useState,
  useEffect,
  RefObject,
  useRef,
  MouseEvent,
} from 'react';
import keyCode from 'ally.js/src/map/keycode';

interface Options {
  popupRef: RefObject<HTMLElement>;
  wrapperRef: RefObject<HTMLElement>;
  buttonRef: RefObject<HTMLElement>;
  popupRole?: 'listbox' | true;
  popupId?: string;
  onClickOutside?: () => void;
}

export default function useMenuButton(options: Options) {
  const [expanded, handleExpanded] = useState<boolean>(false);
  const prevExpanded = useRef<boolean>();
  const {
    wrapperRef,
    popupRef,
    buttonRef,
    popupId,
    popupRole,
    onClickOutside,
  } = options;

  useEffect(() => {
    if (onClickOutside) {
      document.addEventListener('click', handlePopupClickOutside, true);
    }
    return () => {
      if (onClickOutside) {
        document.removeEventListener('click', handlePopupClickOutside, true);
      }
    };
  }, []);

  function handlePopupClickOutside(event: Event) {
    if (!wrapperRef.current) {
      return;
    }
    if (
      onClickOutside &&
      !wrapperRef.current.contains(event.target as HTMLElement)
    ) {
      onClickOutside();
    }
  }

  function handleButtonClick(e: MouseEvent<HTMLElement>) {
    console.log('handleButtonClick', expanded);
    if (expanded) {
      return;
    }
    handleExpanded(true);
  }

  function handleButtonKeyboardEvent(e: KeyboardEvent & { code?: number }) {
    const code = typeof e.code !== 'undefined' ? e.code : e.keyCode;
    switch (code) {
      case keyCode.enter:
      case keyCode.down:
        handleExpanded(true);
        break;
      default:
        break;
    }
  }

  function handlePopupKeyboardEvent(e: KeyboardEvent & { code?: number }) {
    const code = typeof e.code !== 'undefined' ? e.code : e.keyCode;
    switch (code) {
      case keyCode.escape:
        if (popupRef.current && document.activeElement === popupRef.current) {
          popupRef.current.blur();
          return;
        }
        handleExpanded(false);
        break;
      default:
        break;
    }
  }

  function handlePopupBlur() {
    handleExpanded(false);
  }

  useEffect(() => {
    if (
      popupRef.current &&
      popupRef.current.getAttribute('tabindex') === '-1'
    ) {
      if (expanded) {
        console.log('open');
        popupRef.current.focus();
      }
      if (
        !expanded &&
        prevExpanded.current &&
        buttonRef.current &&
        (!document.activeElement ||
          document.activeElement.tagName.toLowerCase() === 'body')
      ) {
        console.log('close');

        buttonRef.current.focus();

        console.log(document.activeElement);
      }
    }
  }, [expanded]);

  useEffect(() => {
    prevExpanded.current = expanded;
  }, [expanded]);

  const buttonAttributes: {
    'aria-expanded': boolean;
    'aria-haspopup': true | 'listbox';
    'aria-controls': string | undefined;
  } = {
    'aria-expanded': expanded,
    'aria-haspopup': popupRole || true,
    'aria-controls': popupId || undefined,
  };

  return {
    buttonAttributes,
    expanded,
    handleExpanded,
    handleButtonClick,
    handleButtonKeyboardEvent,
    handlePopupBlur,
    handlePopupKeyboardEvent,
  };
}
