import React, { SFC, useState, useRef, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { useListBox } from 'lib/index';
import CountryListBoxItem from './CountryListBoxItem';

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const CountryListBox: SFC = () => {
  const [countries, setCountries] = useState<
    Array<{ numericCode: number; name: string }>
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
  } = useListBox(countries.map(item => item && item.numericCode), {
    listRef,
    scrollRef: listRef,
  });

  useEffect(() => {
    fetch('https://restcountries.eu/rest/v2/region/europe')
      .then(data => data.json())
      .then(data => {
        const d = [...data];
        setCountries(d.slice(0, 15));
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
    >
      {Items}
    </List>
  );
};

export default CountryListBox;