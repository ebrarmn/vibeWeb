"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuth = useAuth;
exports.AuthProvider = AuthProvider;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const AuthContext = (0, react_1.createContext)(undefined);
function useAuth() {
    const context = (0, react_1.useContext)(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
function AuthProvider({ children }) {
    const [userData] = (0, react_1.useState)({
        id: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@vibecom.com',
        phone: '',
        birthDate: '',
        gender: '',
        university: '',
        faculty: '',
        department: '',
        grade: '',
        displayName: 'Admin',
        role: 'admin',
        clubIds: [],
        clubRoles: {},
        createdAt: new Date(),
        updatedAt: new Date()
    });
    const [loading] = (0, react_1.useState)(false);
    const value = {
        userData,
        loading
    };
    return ((0, jsx_runtime_1.jsx)(AuthContext.Provider, { value: value, children: children }));
}
