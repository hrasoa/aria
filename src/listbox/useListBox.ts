import { useEffect, useRef, useState, KeyboardEvent, RefObject } from 'react';
import interactionType from 'ally.js/src/observe/interaction-type';
import keyCode from 'ally.js/src/map/keycode';

type ID = any;

interface Item {
  id?: ID;
  label?: string | number;
}

interface Options {
  listRef?: RefObject<HTMLElement>;
  scrollRef?: RefObject<HTMLElement>;
  initialId?: ID;
  onSelect?: (id: ID) => void;
}

const typeAheadRegex = /^[a-z0-9]{1}$/i;
const typeAheadList = Object.keys(keyCode).reduce(
  (acc, key) =>
    typeAheadRegex.exec(key) ? { ...acc, [keyCode[key]]: key } : acc,
  {}
);

export default function useListBox(items: Item[], options: Options = {}) {
  const [highlightedId, setHighlightedId] = useState<ID>();
  const [highlightedRef, setHighlightRef] = useState<RefObject<HTMLElement>>();
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
  const { listRef, scrollRef, onSelect } = options;

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

  useEffect(handleScrollToHighlightedRef, [highlightedRef]);

  function handleOnFocus() {
    if (!interactionTypeHandler.current) {
      return;
    }
    const { key } = interactionTypeHandler.current.get();
    if (key) {
      if (prevHighlightedId.current === list.current[0].id) {
        handleScrollToHighlightedRef();
        return;
      }
      setHighlightedId(list.current[0].id);
    }
  }

  function handleScrollToHighlightedRef() {
    if (
      !(highlightedRef && highlightedRef.current) ||
      !(listRef && listRef.current) ||
      !(scrollRef && scrollRef.current)
    ) {
      return;
    }
    const listClientRect = listRef.current.getBoundingClientRect();
    if (!listClientRect.height) {
      return;
    }
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
  }

  function handleOnKeyDown(e: KeyboardEvent & { code?: number }) {
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
        e.preventDefault();
        onSelect(highlightedId);
        break;
      default:
        if (!(code in typeAheadList)) {
          break;
        }
        e.preventDefault();
        if (typeAhead.current.code && typeAhead.current.code !== code) {
          typeAhead.current.index = -1;
        }
        let index = list.current.findIndex(
          (item, ii) =>
            ii > typeAhead.current.index &&
            !!`${item.label}`.match(new RegExp(`^${typeAheadList[code]}`, 'i'))
        );
        if (index < 0) {
          index = list.current.findIndex(
            item =>
              !!`${item.label}`.match(
                new RegExp(`^${typeAheadList[code]}`, 'i')
              )
          );
        }
        if (index >= 0) {
          typeAhead.current.code = code;
          typeAhead.current.index = index;
          setHighlightedId(list.current[index].id);
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
    setHighlightedId(list.current[index - 1].id);
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
    setHighlightedId(list.current[index + 1].id);
  }

  function handleMoveFirst() {
    setHighlightedId(list.current[0].id);
  }

  function handleMoveLast() {
    setHighlightedId(list.current[list.current.length - 1].id);
  }

  const listAttributes: { 'aria-activedescendant': ID; role: 'listbox' } = {
    'aria-activedescendant': highlightedId,
    role: 'listbox',
  };

  function getItemAttributes(
    id: ID
  ): { 'aria-selected': true | undefined; role: 'option'; id: ID } {
    return {
      'aria-selected': id === highlightedId || undefined,
      id,
      role: 'option',
    };
  }

  useEffect(() => {
    if (!highlightedId) {
      return;
    }
    prevHighlightedId.current = highlightedId;
    typeAhead.current.index = list.current.findIndex(
      item => item.id === highlightedId
    );
  }, [highlightedId]);

  return {
    getItemAttributes,
    handleOnFocus,
    handleOnKeyDown,
    handleScrollToHighlightedRef,
    highlightedId,
    listAttributes,
    setHighlightRef,
    setHighlightedId,
  };
}
