import { useEffect, useRef, useState, KeyboardEvent, RefObject } from 'react';
import interactionType from 'ally.js/src/observe/interaction-type';
import keyCode from 'ally.js/src/map/keycode';

type ID = any;

interface Item {
  id?: ID;
  label?: string | number;
}

interface Options {
  readonly listRef?: RefObject<HTMLElement>;
  readonly scrollRef?: RefObject<HTMLElement>;
  readonly initialId?: ID;
  readonly onFocus?: (key: boolean) => void;
  readonly onSelect?: (id: ID) => void;
}

const typeAheadRegex = /^[a-z0-9]{1}$/i;
const typeAheadList = Object.keys(keyCode).reduce(
  (acc, key) =>
    typeAheadRegex.exec(key) ? { ...acc, [keyCode[key]]: key } : acc,
  {}
);

export default function useListBox(items: Item[], options: Options = {}) {
  const [highlightedId, handleHighlightItem] = useState<ID>();
  const [highlightedRef, setHightlightedRef] = useState<
    RefObject<HTMLElement>
  >();
  const interactionTypeHandler = useRef<{
    disengage: () => void;
    get: () => { key: boolean };
  }>();
  const list = useRef<Item[]>([]);
  const prevHighlightedId = useRef<ID>(options && options.initialId);
  const typeAhead = useRef<{ code: number | null; index: number }>({
    code: null,
    index: -1,
  });
  list.current = [...items];
  const { listRef, scrollRef, onFocus, onSelect } = options;

  useEffect(() => {
    if (!interactionTypeHandler.current) {
      interactionTypeHandler.current = interactionType();
    }

    return () => {
      if (interactionTypeHandler.current) {
        interactionTypeHandler.current.disengage();
      }
    };
  }, []);

  useEffect(() => {
    if (
      !(highlightedRef && highlightedRef.current) ||
      !(listRef && listRef.current) ||
      !(scrollRef && scrollRef.current)
    ) {
      return;
    }
    const listClientRect = listRef.current.getBoundingClientRect();
    const elementClientRect = highlightedRef.current.getBoundingClientRect();
    const listTop = listClientRect.top;
    const listBottom = listTop + listClientRect.height;
    const elementTop = elementClientRect.top;
    const elementBottom = elementTop + elementClientRect.height;
    if (elementBottom > listBottom) {
      scrollRef.current.scrollTop =
        scrollRef.current.scrollTop + (elementBottom - listBottom);
    } else if (elementTop < listTop) {
      scrollRef.current.scrollTop =
        scrollRef.current.scrollTop - (listTop - elementTop);
    }
  }, [highlightedRef]);

  useEffect(() => {
    if (!highlightedId) {
      return;
    }
    prevHighlightedId.current = highlightedId;
  }, [highlightedId]);

  function handleFocus() {
    if (!interactionTypeHandler.current) {
      return;
    }
    const { key } = interactionTypeHandler.current.get();
    if (onFocus) {
      onFocus(key);
      return;
    }
    if (key) {
      handleHighlightItem(
        !prevHighlightedId.current
          ? list.current[0].id
          : prevHighlightedId.current
      );
    }
  }

  function handleKeyboardNavigation(e: KeyboardEvent & { code?: number }) {
    const code = typeof e.code !== 'undefined' ? e.code : e.keyCode;
    switch (code) {
      case keyCode.down:
        e.preventDefault();
        handleMoveDown();
        break;
      case keyCode.up:
        e.preventDefault();
        handleMoveUp();
        break;
      case keyCode.home:
        e.preventDefault();
        handleMoveFirst();
        break;
      case keyCode.end:
        e.preventDefault();
        handleMoveLast();
        break;
      case keyCode.enter:
        if (!onSelect) {
          break;
        }
        onSelect(highlightedId);
        break;
      default:
        if (!(code in typeAheadList)) {
          break;
        }
        e.preventDefault();
        if (typeAhead.current.code !== code) {
          typeAhead.current.index = -1;
        }
        let index = list.current.findIndex(
          (item, ii) =>
            ii > typeAhead.current.index &&
            `${item.label}`.match(new RegExp(`^${typeAheadList[code]}`, 'i'))
        );
        if (index < 0) {
          index = list.current.findIndex(item =>
            `${item.label}`.match(new RegExp(`^${typeAheadList[code]}`, 'i'))
          );
        }
        if (index >= 0) {
          typeAhead.current.code = code;
          typeAhead.current.index = index;
          handleHighlightItem(list.current[index].id);
          return;
        }
        break;
    }
  }

  function handleMoveUp() {
    if (!prevHighlightedId.current) {
      return;
    }
    const index = list.current.findIndex(
      item => item.id === prevHighlightedId.current
    );
    if (index === 0) {
      return;
    }
    handleHighlightItem(list.current[index - 1].id);
  }

  function handleMoveDown() {
    if (!prevHighlightedId.current) {
      return;
    }
    const index = list.current.findIndex(
      item => item.id === prevHighlightedId.current
    );
    if (index === list.current.length - 1) {
      return;
    }
    handleHighlightItem(list.current[index + 1].id);
  }

  function handleMoveFirst() {
    handleHighlightItem(list.current[0].id);
  }

  function handleMoveLast() {
    handleHighlightItem(list.current[list.current.length - 1].id);
  }

  function handleHighlightRef(ref: RefObject<HTMLElement>) {
    setHightlightedRef(ref);
  }

  const listAttributes: { 'aria-activedescendant': ID; role: 'listbox' } = {
    'aria-activedescendant': highlightedId,
    role: 'listbox',
  };

  function getItemAttributes(
    id: ID
  ): { 'aria-selected': true | undefined; role: 'option' } {
    return {
      'aria-selected': id === highlightedId || undefined,
      role: 'option',
    };
  }

  return {
    getItemAttributes,
    handleFocus,
    handleHighlightItem,
    handleHighlightRef,
    handleKeyboardNavigation,
    highlightedId,
    listAttributes,
  };
}
