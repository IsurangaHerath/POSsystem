/**
 * Theme Context
 * 
 * Manages dark/light mode with persistence
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');
    const [isLoading, setIsLoading] = useState(true);

    // Initialize theme from storage
    useEffect(() => {
        const initTheme = async () => {
            try {
                // Check if running in Electron
                if (window.electron?.theme) {
                    const savedTheme = await window.electron.theme.get();
                    setTheme(savedTheme || 'light');
                } else {
                    // Fallback to localStorage for web
                    const savedTheme = localStorage.getItem('theme');
                    setTheme(savedTheme || 'light');
                }
            } catch (error) {
                console.error('Failed to load theme:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initTheme();
    }, []);

    // Apply theme to document
    useEffect(() => {
        if (!isLoading) {
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, [theme, isLoading]);

    // Toggle theme
    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);

        try {
            if (window.electron?.theme) {
                await window.electron.theme.set(newTheme);
            } else {
                localStorage.setItem('theme', newTheme);
            }
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    // Set specific theme
    const setSpecificTheme = async (newTheme) => {
        setTheme(newTheme);

        try {
            if (window.electron?.theme) {
                await window.electron.theme.set(newTheme);
            } else {
                localStorage.setItem('theme', newTheme);
            }
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    const value = {
        theme,
        isDark: theme === 'dark',
        isLoading,
        toggleTheme,
        setTheme: setSpecificTheme
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
