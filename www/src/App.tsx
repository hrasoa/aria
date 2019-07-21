import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import Home from './Home';

const GlobalStyle = createGlobalStyle`
  html {
    font-family: 'Roboto Mono', monospace;
  }
`;

const App = () => (
  <React.Fragment>
    <GlobalStyle />
    <Switch>
      <Route exact={true} path="/" component={Home} />
    </Switch>
  </React.Fragment>
);

export default App;
