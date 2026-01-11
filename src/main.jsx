import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { BrowserRouter } from 'react-router-dom'
import { StoreContextProvider } from './context/StoreContext.jsx'
import favicon from "./assets/favicon.png"; // <- import from src/assets

const link = document.createElement("link");
link.rel = "icon";
link.type = "image/png";
link.href = favicon;
document.head.appendChild(link);

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
    <StoreContextProvider>
    <App />
    </StoreContextProvider>
    </BrowserRouter>
)