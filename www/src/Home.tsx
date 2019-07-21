import React from 'react';
import logo from './react.svg';
import CountryListBox from './CountryListBox/CountryListBox';

function Home() {
  return (
    <div className="Home">
      <div className="Home-header">
        <img src={logo} className="Home-logo" alt="logo" />
        <h2>Welcome to Razzles</h2>
      </div>
      <p className="Home-intro">
        To get started, edit <code>src/App.tsx</code> or{' '}
        <code>src/Home.tsx</code> and save to reload.
      </p>
      <span id="countries-exp">Countries</span>
      <CountryListBox
        ariaLabelledBy="countries-exp"
        border="1px solid rgba(0,0,0,.2)"
        borderRadius="4px"
      />
      <ul className="Home-resources">
        <li>
          <a href="https://github.com/jaredpalmer/razzle">Docs</a>
        </li>
        <li>
          <a href="https://github.com/jaredpalmer/razzle/issues">Issues</a>
        </li>
        <li>
          <a href="https://palmer.chat">Community Slack</a>
        </li>
      </ul>
    </div>
  );
}

export default Home;
