import React from 'react';
import './App.css';
import 'semantic-ui-css/semantic.min.css';
import Panes from './components/Panes';
import { Grid } from 'semantic-ui-react';

function App() {
  return (
    <div className='App'>
      <div id='header'>
        <h1> MatchBot '20</h1>
        <h2> CHNG CodeFest Sept 2020</h2>
      </div>

      <Panes />
    </div>
  );
}

export default App;
