"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ClubRequests;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const firestore_1 = require("../services/firestore");
function ClubRequests() {
    const [requests, setRequests] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [processing, setProcessing] = (0, react_1.useState)(null);
    const fetchRequests = async () => {
        setLoading(true);
        const data = await firestore_1.pendingClubServices.getAll();
        setRequests(data);
        setLoading(false);
    };
    (0, react_1.useEffect)(() => {
        fetchRequests();
    }, []);
    const handleApprove = async (req) => {
        setProcessing(req.id);
        await firestore_1.pendingClubServices.approve(req);
        await fetchRequests();
        setProcessing(null);
    };
    const handleReject = async (id) => {
        setProcessing(id);
        await firestore_1.pendingClubServices.reject(id);
        await fetchRequests();
        setProcessing(null);
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Container, { maxWidth: "md", sx: { mt: 4 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h4", sx: { mb: 4, fontWeight: 'bold' }, children: "Kul\u00FCp Ba\u015Fvuru \u0130stekleri" }), loading ? ((0, jsx_runtime_1.jsx)(material_1.Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh", children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}) })) : requests.length === 0 ? ((0, jsx_runtime_1.jsx)(material_1.Typography, { children: "Bekleyen ba\u015Fvuru yok." })) : (requests.map(req => ((0, jsx_runtime_1.jsxs)(material_1.Card, { sx: { mb: 3 }, children: [(0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", children: req.name }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { color: "text.secondary", children: ["A\u00E7\u0131klama: ", req.description] }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { color: "text.secondary", children: ["Aktiviteler: ", req.activities] }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { color: "text.secondary", children: ["Hedef Kitle: ", req.targetAudience] }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { color: "text.secondary", children: ["Ba\u015Fvuran Kullan\u0131c\u0131 ID: ", req.createdBy] }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { color: "text.secondary", children: ["Tarih: ", req.createdAt?.toDate?.().toLocaleString?.() || String(req.createdAt)] })] }), (0, jsx_runtime_1.jsxs)(material_1.CardActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", color: "success", disabled: processing === req.id, onClick: () => handleApprove(req), children: "Kabul Et" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", color: "error", disabled: processing === req.id, onClick: () => handleReject(req.id), children: "Reddet" })] })] }, req.id))))] }));
}
