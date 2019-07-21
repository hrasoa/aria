import React, { SFC, useRef, RefObject } from 'react';
import styled from 'styled-components';

interface Props {
  highlightedId: any;
  getItemAttributes: (
    id: string
  ) => { 'aria-selected': true | undefined; role: 'option' };
  onHighlightRef: (ref: RefObject<HTMLElement>) => void;
  onHighlightItem: (id: string) => void;
  country: {
    numericCode: string;
    name: string;
  };
}

const ListItem = styled.li`
  padding: 8px;
  transition: background 0.2s;
  ${props =>
    props['aria-selected']
      ? 'background: rgba(0, 0, 0, .1);'
      : 'background: #ffffff;'}
`;

const CountryListBoxItem: SFC<Props> = props => {
  const ref = useRef<HTMLLIElement>(null);
  const {
    highlightedId,
    getItemAttributes,
    onHighlightRef,
    onHighlightItem,
    country,
  } = props;

  if (highlightedId === country.numericCode) {
    onHighlightRef(ref);
  }

  function handleClick() {
    onHighlightItem(country.numericCode);
  }

  const attr = getItemAttributes(country.numericCode);

  return (
    <ListItem ref={ref} onClick={handleClick} {...attr}>
      {country.name}
    </ListItem>
  );
};

export default CountryListBoxItem;
