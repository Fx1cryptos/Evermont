import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
const HomePage = lazy(() => import('@/pages/HomePage').then(module => ({ default: module.HomePage })));
const Login = lazy(() => import('@/pages/auth/Login').then(module => ({ default: module.Login })));
const Register = lazy(() => import('@/pages/auth/Register').then(module => ({ default: module.Register })));
const ServicePage = lazy(() => import('@/pages/ServicePage').then(module => ({ default: module.ServicePage })));
const OpenCheckingPage = lazy(() => import('@/pages/OpenCheckingPage').then(module => ({ default: module.OpenCheckingPage })));
const AboutPage = lazy(() => import('@/pages/AboutPage').then(module => ({ default: module.AboutPage })));
const ProductPage = lazy(() => import('@/pages/ProductPage').then(module => ({ default: module.ProductPage })));
const PublicInfoPage = lazy(() => import('@/pages/PublicInfoPage').then(module => ({ default: module.PublicInfoPage })));
const AdminRoutes = lazy(() => import('@/routes/AdminRoutes').then(module => ({ default: module.AdminRoutes })));
const EvermontAssistant = lazy(() => import('@/components/EvermontAssistant').then(module => ({ default: module.EvermontAssistant })));
const PublicPage = ({ children }) => _jsx(_Fragment, { children: children });
const LoadingFallback = () => (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-white px-6 text-[#101533]", role: "status", "aria-live": "polite", children: _jsxs("div", { className: "flex items-center gap-3 text-sm font-semibold", children: [_jsx("span", { className: "size-3 animate-pulse rounded-full bg-[#C9A227]", "aria-hidden": "true" }), "Loading Evermont\u2026"] }) }));
const RouteAnalytics = () => {
    const location = useLocation();
    useEffect(() => {
        const analyticsWindow = window;
        analyticsWindow.gtag?.('event', 'page_view', { page_path: `${location.pathname}${location.search}`, page_location: window.location.href, page_title: document.title });
    }, [location.pathname, location.search]);
    return null;
};
export const App = () => {
    return (_jsxs(BrowserRouter, { children: [_jsx(RouteAnalytics, {}), _jsx(Suspense, { fallback: _jsx(LoadingFallback, {}), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(PublicPage, { children: _jsx(HomePage, {}) }) }), _jsx(Route, { path: ROUTES.LOGIN, element: _jsx(Login, {}) }), _jsx(Route, { path: ROUTES.SIGN_IN, element: _jsx(Login, {}) }), _jsx(Route, { path: ROUTES.REGISTER, element: _jsx(Register, {}) }), _jsx(Route, { path: ROUTES.SIGN_UP, element: _jsx(Register, {}) }), _jsx(Route, { path: ROUTES.OPEN_CHECKING, element: _jsx(PublicPage, { children: _jsx(OpenCheckingPage, {}) }) }), _jsx(Route, { path: ROUTES.ABOUT, element: _jsx(PublicPage, { children: _jsx(AboutPage, {}) }) }), _jsx(Route, { path: "/checking", element: _jsx(PublicPage, { children: _jsx(ServicePage, {}) }) }), _jsx(Route, { path: "/savings", element: _jsx(PublicPage, { children: _jsx(ServicePage, {}) }) }), _jsx(Route, { path: "/cryptocurrency", element: _jsx(PublicPage, { children: _jsx(ServicePage, {}) }) }), _jsx(Route, { path: "/loans", element: _jsx(PublicPage, { children: _jsx(ServicePage, {}) }) }), _jsx(Route, { path: "/retirement", element: _jsx(PublicPage, { children: _jsx(ServicePage, {}) }) }), _jsx(Route, { path: "/credit-card", element: _jsx(PublicPage, { children: _jsx(ProductPage, {}) }) }), _jsx(Route, { path: "/security", element: _jsx(PublicInfoPage, {}) }), _jsx(Route, { path: "/contact", element: _jsx(PublicInfoPage, {}) }), _jsx(Route, { path: "/open-account", element: _jsx(PublicInfoPage, {}) }), ['/mission', '/membership', '/faq', '/privacy', '/terms', '/disclosures', '/accessibility', '/fraud-prevention'].map(path => _jsx(Route, { path: path, element: _jsx(PublicInfoPage, {}) }, path)), ['/banking/private-checking', '/banking/private-savings', '/banking/credit-card', '/banking/retirement-401k', '/loans/personal', '/loans/auto', '/banking/digital-asset-lending'].map(path => _jsx(Route, { path: path, element: _jsx(ProductPage, {}) }, path)), _jsx(Route, { path: "/admin/*", element: _jsx(AdminRoutes, {}) })] }) }), _jsx(Suspense, { fallback: null, children: _jsx(EvermontAssistant, {}) })] }));
};
