"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeProvider = exports.useTheme = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const locale_1 = require("@mui/material/locale");
const ThemeContext = (0, react_1.createContext)({
    mode: 'light',
    toggleTheme: () => { },
});
const useTheme = () => (0, react_1.useContext)(ThemeContext);
exports.useTheme = useTheme;
const ThemeProvider = ({ children }) => {
    const [mode, setMode] = (0, react_1.useState)('light');
    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };
    const theme = (0, react_1.useMemo)(() => (0, material_1.createTheme)({
        palette: {
            mode,
            primary: {
                main: '#2196f3',
            },
            secondary: {
                main: '#f50057',
            },
            background: {
                default: mode === 'light' ? '#f5f5f5' : '#121212',
                paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
            },
        },
        components: {
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
                    },
                },
            },
        },
    }, locale_1.trTR), [mode]);
    return ((0, jsx_runtime_1.jsx)(ThemeContext.Provider, { value: { mode, toggleTheme }, children: (0, jsx_runtime_1.jsx)(material_1.ThemeProvider, { theme: theme, children: children }) }));
};
exports.ThemeProvider = ThemeProvider;
