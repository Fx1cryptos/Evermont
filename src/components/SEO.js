import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Helmet } from 'react-helmet-async';
const siteName = 'Evermont Credit Union';
const siteUrl = 'https://evermontcredit.online';
export const SEO = ({ title, description, path = '/', noIndex = false }) => {
    const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
    const url = `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
    return (_jsxs(Helmet, { children: [_jsx("title", { children: fullTitle }), _jsx("meta", { name: "description", content: description }), _jsx("meta", { property: "og:title", content: fullTitle }), _jsx("meta", { property: "og:description", content: description }), _jsx("meta", { property: "og:url", content: url }), _jsx("meta", { property: "og:type", content: "website" }), _jsx("meta", { property: "og:site_name", content: siteName }), _jsx("meta", { property: "og:image", content: `${siteUrl}/images/evermont-logo.jpeg` }), _jsx("meta", { name: "twitter:image", content: `${siteUrl}/images/evermont-logo.jpeg` }), _jsx("script", { type: "application/ld+json", children: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: siteName, url: siteUrl, email: 'support@evermontcredit.online', logo: `${siteUrl}/images/evermont-logo.jpeg` }) }), _jsx("meta", { name: "twitter:card", content: "summary" }), _jsx("meta", { name: "twitter:title", content: fullTitle }), _jsx("meta", { name: "twitter:description", content: description }), _jsx("link", { rel: "canonical", href: url }), noIndex && _jsx("meta", { name: "robots", content: "noindex, nofollow" })] }));
};
