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
  controllerRef: RefObject<HTMLElement>;
  wrapperRef?: RefObject<HTMLElement>;
  popupRole?: true | 'listbox' | 'dialog' | 'menu' | 'tree' | 'grid';
  popupId?: string;
  onClickOutside?: () => void;
}

export default function useMenuButton(options: Options) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const prevExpanded = useRef<boolean>();
  const {
    wrapperRef,
    popupRef,
    controllerRef,
    popupId,
    popupRole,
    onClickOutside,
  } = options;

  useEffect(() => {
    if (onClickOutside) {
      document.addEventListener('click', handlePopupOnClickOutside, true);
    }
    return () => {
      if (onClickOutside) {
        document.removeEventListener('click', handlePopupOnClickOutside, true);
      }
    };
  }, []);

  function handlePopupOnClickOutside(event: Event) {
    if (!(wrapperRef && wrapperRef.current)) {
      return;
    }
    if (
      onClickOutside &&
      !wrapperRef.current.contains(event.target as HTMLElement)
    ) {
      onClickOutside();
    }
  }

  function handleControllerOnClick(e: MouseEvent<HTMLElement>) {
    setExpanded(true);
  }

  function handleControllerOnKeyDown(e: KeyboardEvent & { code?: number }) {
    const code = typeof e.code !== 'undefined' ? e.code : e.keyCode;
    switch (code) {
      case keyCode.down:
        setExpanded(true);
        break;
      default:
        break;
    }
  }

  function handlePopupOnKeyDown(e: KeyboardEvent & { code?: number }) {
    const code = typeof e.code !== 'undefined' ? e.code : e.keyCode;
    switch (code) {
      case keyCode.escape:
        if (popupRef.current && document.activeElement === popupRef.current) {
          popupRef.current.blur();
          return;
        }
        setExpanded(false);
        break;
      default:
        break;
    }
  }

  function handlePopupOnBlur() {
    setExpanded(false);
  }

  useEffect(() => {
    if (
      popupRef.current &&
      popupRef.current.getAttribute('tabindex') === '-1'
    ) {
      if (expanded) {
        popupRef.current.focus();
      }
      if (
        !expanded &&
        prevExpanded.current &&
        controllerRef.current &&
        (!document.activeElement ||
          document.activeElement.tagName.toLowerCase() === 'body')
      ) {
        controllerRef.current.focus();
      }
    }
  }, [expanded]);

  useEffect(() => {
    prevExpanded.current = expanded;
  }, [expanded]);

  const controllerAttributes: {
    'aria-controls': string | undefined;
    'aria-expanded': boolean;
    'aria-haspopup': true | 'listbox' | 'dialog' | 'menu' | 'tree' | 'grid';
  } = {
    'aria-controls': popupId,
    'aria-expanded': expanded,
    'aria-haspopup': popupRole || true,
  };

  return {
    controllerAttributes,
    expanded,
    handleControllerOnClick,
    handleControllerOnKeyDown,
    handlePopupOnBlur,
    handlePopupOnKeyDown,
    setExpanded,
  };
}
