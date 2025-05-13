"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DatabaseManager;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const firebase_1 = require("../services/firebase");
function DatabaseManager() {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [result, setResult] = (0, react_1.useState)(null);
    const [confirmOpen, setConfirmOpen] = (0, react_1.useState)(false);
    const handleUpdateLeaderIds = async () => {
        setLoading(true);
        setResult(null);
        try {
            const result = await (0, firebase_1.updateClubLeaderIds)();
            setResult(result);
        }
        catch (error) {
            setResult({
                success: false,
                message: 'İşlem sırasında bir hata oluştu.'
            });
        }
        finally {
            setLoading(false);
            setConfirmOpen(false);
        }
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { p: 3 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Paper, { elevation: 3, sx: {
                    p: 3,
                    borderRadius: 2,
                    background: 'background.paper'
                }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "Veritaban\u0131 Y\u00F6netimi" }), (0, jsx_runtime_1.jsxs)(material_1.Stack, { spacing: 3, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", gutterBottom: true, children: "Kul\u00FCp Lider ID'leri G\u00FCncelleme" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", paragraph: true, children: "Bu i\u015Flem, lider ID'si olmayan kul\u00FCplere ilk admin ID'sini lider ID olarak atayacakt\u0131r." }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", color: "primary", onClick: () => setConfirmOpen(true), disabled: loading, sx: { mt: 1 }, children: loading ? 'İşlem Yapılıyor...' : 'Lider ID\'leri Güncelle' })] }), result && ((0, jsx_runtime_1.jsxs)(material_1.Alert, { severity: result.success ? 'success' : 'error', sx: { mt: 2 }, children: [result.message, result.success && result.updatedCount !== undefined && ((0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", sx: { mt: 1 }, children: ["G\u00FCncellenen: ", result.updatedCount, " kul\u00FCp", result.skippedCount !== undefined && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [" | Atlanan: ", result.skippedCount, " kul\u00FCp"] }))] }))] }))] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: confirmOpen, onClose: () => setConfirmOpen(false), maxWidth: "sm", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u0130\u015Flemi Onayla" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsx)(material_1.Typography, { children: "Bu i\u015Flem, lider ID'si olmayan t\u00FCm kul\u00FCplere ilk admin ID'sini lider ID olarak atayacakt\u0131r. Bu i\u015Flem geri al\u0131namaz. Devam etmek istedi\u011Finizden emin misiniz?" }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setConfirmOpen(false), children: "\u0130ptal" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleUpdateLeaderIds, variant: "contained", color: "primary", disabled: loading, children: loading ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(material_1.CircularProgress, { size: 20, sx: { mr: 1 } }), "\u0130\u015Flem Yap\u0131l\u0131yor..."] })) : ('Onayla ve Devam Et') })] })] })] }));
}
