import {createRoot} from 'react-dom/client';import App from './App';import './styles.css';import './lib/forms.css';import {loadUi,applyUi} from './lib/ui';
import {watchUpdate} from './lib/update';
applyUi(loadUi());watchUpdate();
createRoot(document.getElementById('root')!).render(<App/>);
