import {createRoot} from 'react-dom/client';import App from './App';import './styles.css';import {loadUi,applyUi} from './lib/ui';
applyUi(loadUi());
createRoot(document.getElementById('root')!).render(<App/>);
