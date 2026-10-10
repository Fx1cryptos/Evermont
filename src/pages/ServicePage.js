import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
const serviceContent = {
    checking: {
        eyebrow: 'Everyday banking',
        title: 'Checking that keeps life moving.',
        description: 'Explore a clear, dependable foundation for everyday spending, deposits, and the moments in between.',
        points: ['Everyday account guidance', 'Secure digital access', 'Member support when you need it'],
    },
    savings: {
        eyebrow: 'Build your foundation',
        title: 'Savings with a purpose.',
        description: 'Create room for the goals ahead with thoughtful savings education and member-first support.',
        points: ['Goal-based saving education', 'Account information for members', 'Clear, responsible guidance'],
    },
    loans: {
        eyebrow: 'Borrow with clarity',
        title: 'A lending conversation built around you.',
        description: 'Learn about personal and auto lending, responsible borrowing, and the information to gather before you apply.',
        points: ['Personal loan education', 'Auto loan education', 'Application guidance when available'],
    },
    wealth: {
        eyebrow: 'Private wealth',
        title: 'Plan thoughtfully for what matters most.',
        description: 'Explore long-term planning and wealth-preservation education designed to help you ask better questions.',
        points: ['Long-term planning education', 'Wealth-preservation resources', 'A clear path to support'],
    },
    investments: {
        eyebrow: 'Investments and retirement',
        title: 'Education for your next chapter.',
        description: 'Build your understanding of investing and retirement planning without confusing education for regulated advice.',
        points: ['Investment fundamentals', 'Retirement planning education', '401(k) resources where relevant'],
    },
    'digital-assets': {
        eyebrow: 'Digital-asset education',
        title: 'Understand the opportunity and the risk.',
        description: 'Learn about volatility, security, custody, and the limitations of digital-asset services. Evermont does not claim services that are not verified.',
        points: ['Risk and volatility education', 'Security best practices', 'Clear service limitations'],
    },
};
export const ServicePage = () => {
    const { service = 'checking' } = useParams();
    const content = serviceContent[service] ?? serviceContent.checking;
    return (_jsxs("main", { className: "min-h-screen bg-[#f8fafc] text-[#101533]", children: [_jsx("header", { className: "border-b border-slate-200 bg-white px-5 py-4", children: _jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between", children: [_jsx(Link, { to: ROUTES.HOME, className: "font-semibold tracking-tight text-[#0504AA]", children: "Evermont Credit Union" }), _jsxs("div", { className: "flex items-center gap-3 text-sm font-semibold", children: [_jsx(Link, { to: ROUTES.LOGIN, className: "text-[#0504AA]", children: "Member Login" }), _jsx(Link, { to: ROUTES.REGISTER, className: "rounded-full bg-[#0504AA] px-4 py-2 text-white", children: "Open Account" })] })] }) }), _jsxs("section", { className: "mx-auto max-w-6xl px-5 py-16 lg:py-24", children: [_jsxs(Link, { to: ROUTES.HOME, className: "inline-flex items-center gap-2 text-sm font-semibold text-[#0504AA]", children: [_jsx(ArrowLeft, { className: "size-4" }), " Back to Evermont"] }), _jsxs("div", { className: "mt-12 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-bold uppercase tracking-[0.18em] text-[#C9A227]", children: content.eyebrow }), _jsx("h1", { className: "mt-4 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-6xl", children: content.title }), _jsx("p", { className: "mt-6 max-w-2xl text-lg leading-8 text-slate-600", children: content.description }), _jsxs("div", { className: "mt-8 flex flex-wrap gap-3", children: [_jsxs(Link, { to: ROUTES.REGISTER, className: "inline-flex items-center gap-2 rounded-full bg-[#0504AA] px-6 py-3.5 text-sm font-semibold text-white", children: ["Open an Account ", _jsx(ArrowRight, { className: "size-4" })] }), _jsx(Link, { to: ROUTES.LOGIN, className: "rounded-full border border-slate-300 px-6 py-3.5 text-sm font-semibold text-[#0504AA]", children: "Access Member Banking" })] })] }), _jsxs("aside", { className: "rounded-3xl bg-[#101533] p-8 text-white shadow-xl", children: [_jsx("div", { className: "flex size-12 items-center justify-center rounded-2xl bg-[#C9A227] text-[#101533]", children: _jsx(LockKeyhole, { className: "size-6" }) }), _jsx("h2", { className: "mt-6 text-2xl font-semibold", children: "A thoughtful place to start" }), _jsx("ul", { className: "mt-6 flex flex-col gap-4", children: content.points.map((point) => _jsxs("li", { className: "flex items-start gap-3 text-sm leading-6 text-slate-200", children: [_jsx(CheckCircle2, { className: "mt-1 size-4 shrink-0 text-[#f1d56f]" }), point] }, point)) })] })] })] })] }));
};
export default ServicePage;
export const SERVICE_ROUTES = {
    checking: '/services/checking',
    savings: '/services/savings',
    loans: '/services/loans',
    wealth: '/services/wealth',
    investments: '/services/investments',
    'digital-assets': '/services/digital-assets',
};
export const serviceHref = (service) => SERVICE_ROUTES[service];
export const servicePageLabel = (service) => serviceContent[service].eyebrow;
export const servicePageDescription = (service) => serviceContent[service].description;
export const servicePageTitle = (service) => serviceContent[service].title;
export const servicePagePoints = (service) => serviceContent[service].points;
export const servicePageKeys = Object.keys(serviceContent);
export const servicePageExists = (service) => service in serviceContent;
