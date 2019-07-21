import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import Home from './Home';
import ListBoxView from './ListBoxView';

const GlobalStyle = createGlobalStyle`
  html {
    font-family: 'Roboto Mono', monospace;
  }
  * {
    margin: 0;
    padding: 0;
  }
`;

const App = () => (
  <React.Fragment>
    <GlobalStyle />
    <Switch>
      <Route exact={true} path="/" component={Home} />
      <Route exact={true} path="/listbox" component={ListBoxView} />
    </Switch>
  </React.Fragment>
);

export default App;
