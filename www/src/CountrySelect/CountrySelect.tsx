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
import { useMenuButton } from 'lib/index';

const SelectWrapper = styled.div`
  position: relative;
  margin-top: 10px;
`;

const Button = styled.button`
  border: none;
  background: none;
  background-color: green;
  padding: 4px 8px;
  color: white;
  font-family: inherit;
  font-size: inherit;
  border-radius: 4px;
  min-width: 200px;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &::after {
    content: '\\021D5';
    color: white;
    margin-left: 8px;
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
  top: 0;
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const {
    getItemAttributes,
    handleOnKeyDown,
    handleScrollToHighlightedRef,
    highlightedId,
    listAttributes,
    setHighlightRef,
    setHighlightedId,
  } = useListBox(
    countries.map(country =>
      country.numericCode
        ? { id: country.numericCode, label: country.name }
        : {}
    ),
    {
      listRef,
      onSelect: handleOnSelect,
      scrollRef: listRef,
    }
  );
  const {
    controllerAttributes,
    expanded,
    handleControllerOnClick,
    handleControllerOnKeyDown,
    handlePopupOnBlur,
    handlePopupOnKeyDown,
  } = useMenuButton({
    controllerRef: buttonRef,
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
    handleOnKeyDown(e);
    handlePopupOnKeyDown(e);
  }

  function handlePopupOnFocus() {
    if (!value) {
      setHighlightedId(countries[0].numericCode);
      return;
    }
    if (value === highlightedId) {
      handleScrollToHighlightedRef();
      return;
    }
    setHighlightedId(value);
  }

  function handleOnSelect(id: string) {
    setHighlightedId(id);
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
          onClick={handleOnSelect}
          onHighlightRef={setHighlightRef}
          getItemAttributes={getItemAttributes}
          country={country}
          value={value}
        />
      )),
    [countries, highlightedId, value]
  );

  return (
    <SelectWrapper>
      <Button
        type="button"
        onClick={handleControllerOnClick}
        onKeyDown={handleControllerOnKeyDown}
        ref={buttonRef}
        {...controllerAttributes}
      >
        {(value &&
          (countries.find(c => c.numericCode === value) || { name: '' })
            .name) ||
          'Choose a country'}
      </Button>
      <List
        onFocus={handlePopupOnFocus}
        onBlur={handlePopupOnBlur}
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
