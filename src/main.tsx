import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';

console.log('React Boot Sequence Initiated');
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Fatal: Root element missing');
  throw new Error('Failed to find root element');
}

// @ts-ignore
window.__COURTSIDE_BOOTED__ = true;
const statusEl = document.getElementById('boot-status');
if (statusEl) statusEl.innerText = 'Synchronizing React Kernel';

const container = document.getElementById('boot-container');
if (container) container.style.opacity = '0';

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
console.log('Render call completed');
