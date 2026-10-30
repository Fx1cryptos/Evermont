import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { App } from './App';
import { Analytics } from '@vercel/analytics/react';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsxs(HelmetProvider, { children: [_jsx(App, {}), _jsx(Analytics, {})] }) }));
