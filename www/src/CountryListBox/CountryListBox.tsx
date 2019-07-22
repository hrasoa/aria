import React, { SFC, useState, useRef, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { useListBox } from 'lib/index';
import CountryListBoxItem from './CountryListBoxItem';

const List = styled.ul.attrs((props: { ariaLabelledBy?: string }) => ({
  'aria-labelledby': props.ariaLabelledBy || undefined,
}))`
  margin: 0;
  margin-top: 10px;
  padding: 0;
  list-style: none;
  max-height: 30vh;
  overflow-y: scroll;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
`;

interface Props {
  ariaLabelledBy?: string;
}

const CountryListBox: SFC<Props> = props => {
  const [countries, setCountries] = useState<
    Array<{ numericCode: string; name: string }>
  >([]);
  const listRef = useRef<HTMLUListElement>(null);
  const {
    highlightedId,
    handleOnFocus,
    handleOnKeyDown,
    setHighlightedId,
    setHighlightRef,
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
          onHighlightItem={setHighlightedId}
          onHighlightRef={setHighlightRef}
          getItemAttributes={getItemAttributes}
          country={country}
        />
      )),
    [countries, highlightedId]
  );

  return (
    <List
      onFocus={handleOnFocus}
      onKeyDown={handleOnKeyDown}
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
