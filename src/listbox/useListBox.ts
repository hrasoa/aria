import { useEffect, useRef, useState } from 'react';
import interactionType from 'ally.js/src/observe/interaction-type';
import keyCode from 'ally.js/src/map/keycode';

interface Options {
  listRef?: { current: HTMLElement };
  scrollRef?: { current: HTMLElement };
}

export default function useListBox(items: string[], options: Options = {}) {
  const [activeId, setActiveId] = useState<string>();
  const [activeRef, setActiveRef] = useState();
  const interactionTypeHandler = useRef<{
    disengage: () => void;
    get: () => { key: boolean };
  }>();
  const itemsByIds = useRef<string[]>([]);
  const prevActiveId = useRef<string>();
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
      !(activeRef && activeRef.current) ||
      !(listRef && listRef.current) ||
      !(scrollRef && scrollRef.current)
    ) {
      return;
    }
    const listClientRect = listRef.current.getBoundingClientRect();
    const elementClientRect = activeRef.current.getBoundingClientRect();
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
  }, [activeRef]);

  useEffect(() => {
    prevActiveId.current = activeId;
  }, [activeId]);

  function handleFocus() {
    if (!interactionTypeHandler.current) {
      return;
    }
    const { key } = interactionTypeHandler.current.get();
    if (key && !prevActiveId.current) {
      handleSelectItem(itemsByIds.current[0]);
    }
  }

  function handleNavigation(e: KeyboardEvent) {
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

  function handleSelectItem(itemId: string) {
    if (itemId === prevActiveId.current) {
      return;
    }
    setActiveId(itemId);
  }

  function handleMoveUp() {
    if (!prevActiveId.current) {
      return;
    }
    const index = itemsByIds.current.indexOf(prevActiveId.current);
    if (index === 0) {
      return;
    }
    handleSelectItem(itemsByIds.current[index - 1]);
  }

  function handleMoveDown() {
    if (!prevActiveId.current) {
      return;
    }
    const index = itemsByIds.current.indexOf(prevActiveId.current);
    if (index === itemsByIds.current.length - 1) {
      return;
    }
    handleSelectItem(itemsByIds.current[index + 1]);
  }

  function handleMoveFirst() {
    handleSelectItem(itemsByIds.current[0]);
  }

  function handleMoveLast() {
    handleSelectItem(itemsByIds.current[itemsByIds.current.length - 1]);
  }

  function handleSelectActiveRef(ref: { current: HTMLElement }) {
    setActiveRef(ref);
  }

  const listAttributes = {
    'aria-activedescendant': activeId,
    role: 'listbox',
  };

  function getItemAttributes(id: string) {
    return {
      'aria-selected': id === activeId || null,
      role: 'option',
    };
  }

  return {
    activeId,
    handleFocus,
    handleMoveDown,
    handleMoveUp,
    handleNavigation,
    handleSelectActiveRef,
    handleSelectItem,
    listAttributes,
    getItemAttributes,
  };
}
