"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
const material_1 = require("@mui/material");
const theme_1 = __importDefault(require("./theme"));
const Dashboard_1 = __importDefault(require("./pages/Dashboard"));
const Login_1 = __importDefault(require("./pages/Login"));
const Layout_1 = __importDefault(require("./components/Layout"));
const Clubs_1 = __importDefault(require("./pages/Clubs"));
const Users_1 = __importDefault(require("./pages/Users"));
const Events_1 = __importDefault(require("./pages/Events"));
const ClubRequests_1 = __importDefault(require("./pages/ClubRequests"));
const AuthContext_1 = require("./contexts/AuthContext");
const ThemeContext_1 = require("./context/ThemeContext");
function App() {
    return ((0, jsx_runtime_1.jsxs)(material_1.ThemeProvider, { theme: theme_1.default, children: [(0, jsx_runtime_1.jsx)(material_1.CssBaseline, {}), (0, jsx_runtime_1.jsx)(AuthContext_1.AuthProvider, { children: (0, jsx_runtime_1.jsx)(ThemeContext_1.ThemeProvider, { children: (0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsxs)(react_router_dom_1.Routes, { children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/login", element: (0, jsx_runtime_1.jsx)(Login_1.default, {}) }), (0, jsx_runtime_1.jsxs)(react_router_dom_1.Route, { path: "/", element: (0, jsx_runtime_1.jsx)(Layout_1.default, {}), children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { index: true, element: (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/login", replace: true }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "dashboard", element: (0, jsx_runtime_1.jsx)(Dashboard_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "clubs", element: (0, jsx_runtime_1.jsx)(Clubs_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "users", element: (0, jsx_runtime_1.jsx)(Users_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "events", element: (0, jsx_runtime_1.jsx)(Events_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "club-requests", element: (0, jsx_runtime_1.jsx)(ClubRequests_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "*", element: (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/login", replace: true }) })] })] }) }) }) })] }));
}
exports.default = App;
