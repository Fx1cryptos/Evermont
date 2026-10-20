import { jsx as _jsx } from "react/jsx-runtime";
import { SEO } from './SEO';
export const PageMeta = ({ title, description, canonical, noIndex }) => (_jsx(SEO, { title: title, description: description, path: canonical?.replace('https://evermontcredit.online', '') || '/', noIndex: noIndex }));
