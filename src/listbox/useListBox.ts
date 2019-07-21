import { useEffect, useRef, useState, KeyboardEvent, RefObject } from 'react';
import interactionType from 'ally.js/src/observe/interaction-type';
import keyCode from 'ally.js/src/map/keycode';

type ID = any;

interface Options {
  readonly listRef?: RefObject<HTMLElement>;
  readonly scrollRef?: RefObject<HTMLElement>;
  readonly initialId?: ID;
  readonly onFocus?: (key: boolean) => void;
}

export default function useListBox(items: ID[], options: Options = {}) {
  const [highlightedId, handleHighlightItem] = useState<ID>();
  const [highlightedRef, setHightlightedRef] = useState<
    RefObject<HTMLElement>
  >();
  const interactionTypeHandler = useRef<{
    disengage: () => void;
    get: () => { key: boolean };
  }>();
  const itemsByIds = useRef<ID[]>([]);
  const prevHighlightedId = useRef<ID>(options && options.initialId);
  itemsByIds.current = [...items];
  const { listRef, scrollRef, onFocus } = options;

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
          ? itemsByIds.current[0]
          : prevHighlightedId.current
      );
    }
  }

  function handleKeyboardNavigation(e: KeyboardEvent) {
    switch (e.which) {
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
      default:
        break;
    }
  }

  function handleMoveUp() {
    if (!prevHighlightedId.current) {
      return;
    }
    const index = itemsByIds.current.indexOf(prevHighlightedId.current);
    if (index === 0) {
      return;
    }
    handleHighlightItem(itemsByIds.current[index - 1]);
  }

  function handleMoveDown() {
    if (!prevHighlightedId.current) {
      return;
    }
    const index = itemsByIds.current.indexOf(prevHighlightedId.current);
    if (index === itemsByIds.current.length - 1) {
      return;
    }
    handleHighlightItem(itemsByIds.current[index + 1]);
  }

  function handleMoveFirst() {
    handleHighlightItem(itemsByIds.current[0]);
  }

  function handleMoveLast() {
    handleHighlightItem(itemsByIds.current[itemsByIds.current.length - 1]);
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
