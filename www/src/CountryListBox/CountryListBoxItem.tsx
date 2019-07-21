import React, { SFC, useRef, useEffect, RefObject } from 'react';

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
    <li ref={ref} onClick={handleClick} {...attr}>
      {highlightedId === country.numericCode && 'x'} {country.name}
    </li>
  );
};

export default CountryListBoxItem;
