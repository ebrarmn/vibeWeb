"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Logo;
const jsx_runtime_1 = require("react/jsx-runtime");
function Logo() {
    return ((0, jsx_runtime_1.jsxs)("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [(0, jsx_runtime_1.jsx)("defs", { children: (0, jsx_runtime_1.jsxs)("linearGradient", { id: "vibe-gradient", x1: "0", y1: "0", x2: "48", y2: "48", gradientUnits: "userSpaceOnUse", children: [(0, jsx_runtime_1.jsx)("stop", { stopColor: "#2196f3" }), (0, jsx_runtime_1.jsx)("stop", { offset: "1", stopColor: "#a259f7" })] }) }), (0, jsx_runtime_1.jsx)("rect", { width: "48", height: "48", rx: "12", fill: "url(#vibe-gradient)" }), (0, jsx_runtime_1.jsx)("text", { x: "50%", y: "50%", textAnchor: "middle", dominantBaseline: "central", fontFamily: "Segoe UI, Roboto, Helvetica, Arial, sans-serif", fontWeight: "bold", fontSize: "22", fill: "#fff", letterSpacing: "2", children: "V" })] }));
}
