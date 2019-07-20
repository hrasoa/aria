import { useEffect, useRef, useState, KeyboardEvent, RefObject } from 'react';
import interactionType from 'ally.js/src/observe/interaction-type';
import keyCode from 'ally.js/src/map/keycode';

interface Options {
  readonly listRef?: RefObject<HTMLElement>;
  readonly scrollRef?: RefObject<HTMLElement>;
}

type ID = any;

export default function useListBox(items: ID[], options: Options = {}) {
  const [highlightedId, setHighlightedId] = useState<ID>();
  const [highlightedRef, setHightlightedRef] = useState();
  const interactionTypeHandler = useRef<{
    disengage: () => void;
    get: () => { key: boolean };
  }>();
  const itemsByIds = useRef<ID[]>([]);
  const prevHighlightedId = useRef<ID>();
  itemsByIds.current = [...items];
  const { listRef, scrollRef } = options;

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
    const listBottom = listClientRect.top + listClientRect.height;
    const elementBottom = elementClientRect.top + elementClientRect.height;
    if (elementBottom > listBottom) {
      scrollRef.current.scrollTop =
        scrollRef.current.scrollTop + (elementBottom - listBottom);
    } else if (elementClientRect.top < listClientRect.top) {
      scrollRef.current.scrollTop =
        scrollRef.current.scrollTop -
        (listClientRect.top - elementClientRect.top);
    }
  }, [highlightedRef]);

  useEffect(() => {
    prevHighlightedId.current = highlightedId;
  }, [highlightedId]);

  function handleFocus() {
    if (!interactionTypeHandler.current) {
      return;
    }
    const { key } = interactionTypeHandler.current.get();
    if (key && !prevHighlightedId.current) {
      handleHighlightItem(itemsByIds.current[0]);
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

  function handleHighlightItem(id: ID) {
    if (id === prevHighlightedId.current) {
      return;
    }
    setHighlightedId(id);
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
