import React from 'react';
import styled from 'styled-components';
import CountryListBox from './CountryListBox/CountryListBox';
import { Link, Switch, Route } from 'react-router-dom';
import CountrySelect from './CountrySelect/CountrySelect';

const Content = styled.div`
  width: 50%;
  min-height: 100vh;
  box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
`;

const Demo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  left: 50%;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1;
  background: rgba(0, 0, 0, 0.05);
`;

export default function ListBoxView() {
  return (
    <main>
      <Content>
        <h1>Listbox</h1>
        <ul>
          <li>
            <Link to="/listbox">Scrollable</Link>
          </li>
          <li>
            <Link to="/listbox/collapsible">collapsible</Link>
          </li>
        </ul>
      </Content>
      <Demo>
        <Switch>
          <Route
            path="/listbox"
            exact
            render={() => (
              <div>
                <span id="countries-exp">Countries</span>
                <CountryListBox ariaLabelledBy="countries-exp" />
              </div>
            )}
          />
          <Route
            path="/listbox/collapsible"
            exact
            render={() => (
              <div>
                <span id="countries-exp">Countries</span>
                <CountrySelect ariaLabelledBy="countries-exp" />
              </div>
            )}
          />
        </Switch>
      </Demo>
    </main>
  );
}
