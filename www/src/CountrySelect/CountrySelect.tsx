import React, {
  SFC,
  useState,
  useRef,
  useMemo,
  useEffect,
  KeyboardEvent,
} from 'react';
import styled from 'styled-components';
import { useListBox } from 'lib/index';
import CountryListBoxItem from './CountrySelectItem';
import useMenuButton from 'lib/menuButton/useMenuButton';

const SelectWrapper = styled.div`
  position: relative;
`;

const Button = styled.button`
  border: none;
  background: none;
  &:focus {
    border: 1px solid red;
  }
`;

const List = styled.ul.attrs((props: { ariaLabelledBy?: string }) => ({
  'aria-labelledby': props.ariaLabelledBy || undefined,
}))`
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 30vh;
  overflow-y: scroll;
  display: ${(props: { expanded: boolean }) =>
    props.expanded ? 'block' : 'none'};
  border-radius: 4px;
  position: absolute;
  top: 100px;
  z-index: 3;
  left: 0;
  background: #ffffff;
  width: 20vw;
`;

interface Props {
  ariaLabelledBy?: string;
}

const CountrySelect: SFC<Props> = props => {
  const [countries, setCountries] = useState<
    Array<{ numericCode: string; name: string }>
  >([]);
  const [value, setValue] = useState<string>();
  const listRef = useRef<HTMLUListElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const {
    highlightedId,
    handleKeyboardNavigation,
    handleHighlightItem,
    handleScrollToHighlightedRef,
    handleHighlightRef,
    listAttributes,
    getItemAttributes,
  } = useListBox(
    countries.map(country =>
      country.numericCode
        ? { id: country.numericCode, label: country.name }
        : {}
    ),
    {
      listRef,
      scrollRef: listRef,
      onSelect: handleSelect,
    }
  );
  const {
    buttonAttributes,
    expanded,
    handleButtonClick,
    handleButtonKeyboardEvent,
    handlePopupBlur,
    handlePopupKeyboardEvent,
  } = useMenuButton({
    wrapperRef,
    buttonRef,
    popupRef: listRef,
    popupRole: 'listbox',
  });

  useEffect(() => {
    fetch('https://restcountries.eu/rest/v2/region/europe')
      .then(data => data.json())
      .then(data => {
        const d = [...data];
        setCountries(d.slice(0, 40));
      });
  }, []);

  function handleKeyboardEvents(e: KeyboardEvent) {
    handleKeyboardNavigation(e);
    handlePopupKeyboardEvent(e);
  }

  function handlePopupFocus() {
    if (!value) {
      handleHighlightItem(countries[0].numericCode);
      return;
    }
    if (value === highlightedId) {
      handleScrollToHighlightedRef();
      return;
    }
    handleHighlightItem(value);
  }

  function handleSelect(id: string) {
    handleHighlightItem(id);
    setValue(id);
    if (listRef.current) {
      listRef.current.blur();
    }
  }

  const Items = useMemo(
    () =>
      countries.map((country, ii) => (
        <CountryListBoxItem
          key={country.numericCode}
          highlightedId={highlightedId}
          onClick={handleSelect}
          onHighlightRef={handleHighlightRef}
          getItemAttributes={getItemAttributes}
          country={country}
          value={value}
        />
      )),
    [countries, highlightedId, value]
  );

  return (
    <SelectWrapper ref={wrapperRef}>
      <Button
        type="button"
        onClick={handleButtonClick}
        onKeyDown={handleButtonKeyboardEvent}
        ref={buttonRef}
        {...buttonAttributes}
      >
        Choose a country
      </Button>
      <List
        onFocus={handlePopupFocus}
        onBlur={handlePopupBlur}
        onKeyDown={handleKeyboardEvents}
        tabIndex={-1}
        ref={listRef}
        expanded={expanded}
        {...listAttributes}
        {...props}
      >
        {Items}
      </List>
    </SelectWrapper>
  );
};

export default CountrySelect;
