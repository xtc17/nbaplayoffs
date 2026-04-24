import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find root element');

window.onerror = (msg, url, lineNo, columnNo, error) => {
  rootElement.innerHTML = `
    <div style="background: #0a0a0a; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ff4444; font-family: sans-serif; text-align: center; padding: 40px;">
      <div style="font-weight: 900; font-size: 48px; margin-bottom: 20px;">SYSTEM FAILURE</div>
      <div style="font-size: 14px; opacity: 0.8; max-width: 600px; line-height: 1.6;">${msg}</div>
      <div style="margin-top: 40px; font-size: 10px; font-weight: bold; letter-spacing: 0.2em; text-transform: uppercase;">Reference Code: NBA_FATAL_TRANSITION</div>
    </div>
  `;
  return false;
};

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
