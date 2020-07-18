import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import MaxMinesCaptcha from './lib'

class App extends Component {
  render() {
    return (
      <div className="App">
        <MaxMinesCaptcha />
      </div>
    );
  }
}

export default App;
