import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './agent/tracy-agent.css';
import './agent/cascade-theme.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
