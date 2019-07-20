import React, { SFC, useRef, useEffect, RefObject } from 'react';

interface Props {
  highlightedId: any;
  getItemAttributes: (
    id: number
  ) => { 'aria-selected': true | undefined; role: 'option' };
  onHighlightRef: (ref: RefObject<HTMLElement>) => void;
  onHighlightItem: (id: number) => void;
  country: {
    numericCode: number;
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

  useEffect(() => {
    if (highlightedId === country.numericCode) {
      onHighlightRef(ref);
    }
  }, [highlightedId]);

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
