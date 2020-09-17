/*
  This component is very easy to use and lets us display different components
  in separated tabs without needing to set up a router or menu etc.
*/

import React from 'react';
import ChatBotWrapper from './ChatBotWrapper';
import About from './About';
import Team from './Team';
import technical_flow from '../images/technical_flow.png';
import architecture from '../images/architecture.png';
import lean_canvas from '../images/lean_canvas.png';
import { Tab } from 'semantic-ui-react';

const panes = [
  {
    menuItem: 'Chat Bot',
    render: () => (
      <Tab.Pane>
        <ChatBotWrapper />
      </Tab.Pane>
    ),
  },
  {
    menuItem: 'Team',
    render: () => (
      <Tab.Pane>
        <Team />
      </Tab.Pane>
    ),
  },
  {
    menuItem: 'About',
    render: () => (
      <Tab.Pane>
        <About />
      </Tab.Pane>
    ),
  },
  {
    menuItem: 'Lean Canvas',
    render: () => (
      <Tab.Pane>
        <img src={lean_canvas} alt='lean canvas' width='70%'></img>
      </Tab.Pane>
    ),
  },
  {
    menuItem: 'Technical Flow',
    render: () => (
      <Tab.Pane>
        <img
          src={technical_flow}
          alt='technical flow diagram'
          width='60%'
        ></img>
      </Tab.Pane>
    ),
  },
  {
    menuItem: 'Architecture',
    render: () => (
      <Tab.Pane>
        <img src={architecture} alt='architecture diagram' width='60%'></img>
      </Tab.Pane>
    ),
  },
];

const TabExampleBasic = () => <Tab panes={panes} />;

export default TabExampleBasic;
