import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import { trTR } from '@mui/material/locale';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    mode: ThemeMode;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    mode: 'light',
    toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<ThemeMode>('light');

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    const theme = useMemo(
        () =>
            createTheme(
                {
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
                },
                trTR
            ),
        [mode]
    );

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
        </ThemeContext.Provider>
    );
}; 