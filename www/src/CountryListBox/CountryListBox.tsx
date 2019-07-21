import React, { SFC, useState, useRef, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { useListBox } from 'lib/index';
import CountryListBoxItem from './CountryListBoxItem';

const List = styled.ul.attrs((props: { ariaLabelledBy?: string }) => ({
  'aria-labelledby': props.ariaLabelledBy || undefined,
}))`
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 30vh;
  overflow-y: scroll;
  ${(props: { border?: string; borderRadius?: string }) =>
    [
      props.border ? `border: ${props.border};` : '',
      props.borderRadius ? `border-radius: ${props.borderRadius}` : '',
    ].join('')}
`;

interface Props {
  border?: string;
  borderRadius?: string;
  ariaLabelledBy?: string;
}

const CountryListBox: SFC<Props> = props => {
  const [countries, setCountries] = useState<
    Array<{ numericCode: string; name: string }>
  >([]);
  const listRef = useRef<HTMLUListElement>(null);
  const {
    highlightedId,
    handleFocus,
    handleKeyboardNavigation,
    handleHighlightItem,
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
    }
  );

  useEffect(() => {
    fetch('https://restcountries.eu/rest/v2/region/europe')
      .then(data => data.json())
      .then(data => {
        const d = [...data];
        setCountries(d.slice(0, 40));
      });
  }, []);

  const Items = useMemo(
    () =>
      countries.map((country, ii) => (
        <CountryListBoxItem
          key={country.numericCode}
          highlightedId={highlightedId}
          onHighlightItem={handleHighlightItem}
          onHighlightRef={handleHighlightRef}
          getItemAttributes={getItemAttributes}
          country={country}
        />
      )),
    [countries, highlightedId]
  );

  return (
    <List
      onFocus={handleFocus}
      onKeyDown={handleKeyboardNavigation}
      tabIndex={0}
      ref={listRef}
      {...listAttributes}
      {...props}
    >
      {Items}
    </List>
  );
};

export default CountryListBox;
