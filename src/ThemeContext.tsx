import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

export const theme = {
  colors: {
    primary: '#E6E6FA',
    on_primary: '#2D2D4A',
    primary_container: '#F0F0FF',
    on_primary_container: '#1A1A30',
    secondary: '#FFD1DC',
    on_secondary: '#4A2D35',
    secondary_container: '#FFF0F4',
    on_secondary_container: '#301A20',
    tertiary: '#B5EAD7',
    on_tertiary: '#1A4030',
    error: '#FFADAD',
    on_error: '#4A1A1A',
    error_container: '#FFD6D6',
    on_error_container: '#330D0D',
    background: '#FEFEFF',
    on_background: '#2A2A35',
    secondary_background: '#F8F8FC',
    surface: '#FEFEFF',
    on_surface: '#2A2A35',
    surface_variant: '#F0F0F8',
    on_surface_variant: '#45454F',
    primary_text: '#2A2A35',
    secondary_text: '#45454F',
    outline: '#9090A0',
    divider: '#E0E0E8',
  },
  darkColors: {
    primary: '#C8C8F0',
    on_primary: '#30304A',
    primary_container: '#404060',
    on_primary_container: '#E6E6FA',
    secondary: '#F0B8C8',
    on_secondary: '#4A2830',
    secondary_container: '#603848',
    on_secondary_container: '#FFD1DC',
    tertiary: '#90D0B8',
    on_tertiary: '#183828',
    error: '#F0A0A0',
    on_error: '#4A1818',
    error_container: '#602828',
    on_error_container: '#FFD6D6',
    background: '#1A1A20',
    on_background: '#E8E8F0',
    secondary_background: '#24242C',
    surface: '#1A1A20',
    on_surface: '#E8E8F0',
    surface_variant: '#40404A',
    on_surface_variant: '#C8C8D0',
    primary_text: '#E8E8F0',
    secondary_text: '#B0B0C0',
    outline: '#7070A0',
    divider: '#40404A',
  },
  fonts: {
    primary: "'Outfit', sans-serif",
    secondary: "'Plus Jakarta Sans', sans-serif",
  },
  spacing: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  radii: {
    none: 0,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    full: 9999,
  },
  shadows: {
    xs: '0 2px 4px rgba(0,0,0,0.08)',
    sm: '0 4px 8px rgba(0,0,0,0.08)',
    md: '0 8px 16px rgba(0,0,0,0.08)',
    lg: '0 12px 24px rgba(0,0,0,0.08)',
  },
};

export type ThemeType = typeof theme;

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev: boolean) => !prev);

  const currentTheme = {
    ...theme,
    ...(isDarkMode ? theme.darkColors : theme.colors),
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <StyledThemeProvider theme={currentTheme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
