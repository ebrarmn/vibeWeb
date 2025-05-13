"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const SearchBar = ({ searchTerm, onSearchChange, placeholder = 'Ara...', filters }) => {
    const theme = (0, material_1.useTheme)();
    return ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: {
            p: 2,
            mb: 3,
            borderRadius: 1,
            bgcolor: 'background.paper',
            boxShadow: theme.shadows[1]
        }, children: (0, jsx_runtime_1.jsxs)(material_1.Stack, { direction: { xs: 'column', sm: 'row' }, spacing: 2, alignItems: "center", children: [(0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, value: searchTerm, onChange: (e) => onSearchChange(e.target.value), placeholder: placeholder, variant: "outlined", size: "small", InputProps: {
                        startAdornment: ((0, jsx_runtime_1.jsx)(material_1.InputAdornment, { position: "start", children: (0, jsx_runtime_1.jsx)(icons_material_1.Search, { color: "action" }) })),
                        endAdornment: searchTerm && ((0, jsx_runtime_1.jsx)(material_1.InputAdornment, { position: "end", children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => onSearchChange(''), children: (0, jsx_runtime_1.jsx)(icons_material_1.Clear, {}) }) }))
                    }, sx: {
                        bgcolor: 'background.default',
                        '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                                borderColor: theme.palette.primary.main,
                            },
                        },
                    } }), filters && Object.entries(filters).map(([key, filter]) => ((0, jsx_runtime_1.jsxs)(material_1.FormControl, { size: "small", sx: { minWidth: 120 }, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: key }), (0, jsx_runtime_1.jsx)(material_1.Select, { value: filter.value, onChange: (e) => filter.onChange(e.target.value), label: key, children: filter.options.map((option) => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: option.value, children: option.label }, option.value))) })] }, key)))] }) }));
};
exports.default = SearchBar;
