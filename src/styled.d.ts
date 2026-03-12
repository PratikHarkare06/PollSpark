import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    primary: string;
    on_primary: string;
    primary_container: string;
    on_primary_container: string;
    secondary: string;
    on_secondary: string;
    secondary_container: string;
    on_secondary_container: string;
    tertiary: string;
    on_tertiary: string;
    error: string;
    on_error: string;
    error_container: string;
    on_error_container: string;
    background: string;
    on_background: string;
    secondary_background: string;
    surface: string;
    on_surface: string;
    surface_variant: string;
    on_surface_variant: string;
    primary_text: string;
    secondary_text: string;
    outline: string;
    divider: string;
    fonts: {
      primary: string;
      secondary: string;
    };
    spacing: {
      none: number;
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
      xxxl: number;
    };
    radii: {
      none: number;
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
      full: number;
    };
    shadows: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
    };
  }
}
