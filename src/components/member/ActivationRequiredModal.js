import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EVERMONT_COLORS as C } from '@/constants/design';
import { ROUTES } from '@/constants/routes';
const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
export const ActivationRequiredModal = ({ open, fee, ratePercent, onClose }) => {
    const navigate = useNavigate();
    useEffect(() => {
        if (!open)
            return;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape')
                onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);
    if (!open)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4", role: "dialog", "aria-modal": "true", "aria-labelledby": "activation-required-title", children: _jsxs("div", { className: "w-full max-w-md rounded-2xl bg-white p-6 shadow-xl", style: { borderTop: `4px solid ${C.gold}` }, children: [_jsx("h2", { id: "activation-required-title", className: "text-center text-xl font-semibold", style: { color: C.blue }, children: "Account activation required" }), _jsx("p", { className: "mt-3 text-center text-sm leading-6 text-slate-600", children: "Please activate your account before using this feature." }), _jsxs("div", { className: "mt-5 rounded-xl bg-[#f7f8fc] p-4 text-center", children: [_jsx("p", { className: "text-xs font-bold uppercase tracking-[.16em] text-[#C9A227]", children: "Activation fee" }), _jsx("p", { className: "mt-1 text-2xl font-semibold", style: { color: C.blue }, children: fee != null ? money(fee) : 'Unavailable, please contact support' }), ratePercent != null && _jsxs("p", { className: "mt-1 text-xs text-slate-500", children: ["Calculated at ", ratePercent, "% of available balance."] })] }), _jsx("button", { type: "button", onClick: () => { onClose(); navigate(ROUTES.SUPPORT); }, className: "mt-5 w-full rounded-xl px-4 py-2.5 font-semibold text-white", style: { background: C.blue }, children: "Contact Support" }), _jsx("button", { type: "button", onClick: onClose, className: "mt-3 w-full rounded-xl border border-slate-200 px-4 py-2.5 font-semibold text-slate-700", children: "OK" }), _jsx("button", { type: "button", onClick: () => { onClose(); navigate(ROUTES.ACTIVATION); }, className: "mt-3 w-full rounded-xl border border-[#C9A227] px-4 py-2.5 font-semibold text-[#0504AA]", children: "Activate Your Account" })] }) }));
};
export default ActivationRequiredModal;
