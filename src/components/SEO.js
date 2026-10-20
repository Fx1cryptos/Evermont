import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Helmet } from 'react-helmet-async';
const siteName = 'Evermont Credit Union';
const siteUrl = 'https://evermontcredit.online';
export const SEO = ({ title, description, path = '/', noIndex = false }) => {
    const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
    const url = `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
    return (_jsxs(Helmet, { children: [_jsx("title", { children: fullTitle }), _jsx("meta", { name: "description", content: description }), _jsx("meta", { property: "og:title", content: fullTitle }), _jsx("meta", { property: "og:description", content: description }), _jsx("meta", { property: "og:url", content: url }), _jsx("meta", { property: "og:type", content: "website" }), _jsx("meta", { name: "twitter:card", content: "summary" }), _jsx("meta", { name: "twitter:title", content: fullTitle }), _jsx("meta", { name: "twitter:description", content: description }), _jsx("link", { rel: "canonical", href: url }), noIndex && _jsx("meta", { name: "robots", content: "noindex, nofollow" })] }));
};
