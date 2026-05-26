import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    neutral: Palette["primary"];
  }

  interface PaletteOptions {
    neutral?: PaletteOptions["primary"];
  }
}

const paletteCommon = {
  success: {
    main: "#16A34A",
    light: "#86EFAC",
    dark: "#166534",
    contrastText: "#FFFFFF",
  },
  warning: {
    main: "#D97706",
    light: "#FCD34D",
    dark: "#92400E",
    contrastText: "#111827",
  },
  error: {
    main: "#DC2626",
    light: "#FCA5A5",
    dark: "#991B1B",
    contrastText: "#FFFFFF",
  },
  neutral: {
    main: "#64748B",
    light: "#CBD5E1",
    dark: "#0F172A",
    contrastText: "#FFFFFF",
  },
} as const;

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#16A34A",
      light: "#86EFAC",
      dark: "#166534",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#0F766E",
      light: "#5EEAD4",
      dark: "#134E4A",
      contrastText: "#FFFFFF",
    },
    info: {
      main: "#2563EB",
      light: "#93C5FD",
      dark: "#1D4ED8",
      contrastText: "#FFFFFF",
    },
    ...paletteCommon,
    background: {
      default: "#F7FAF7",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F172A",
      secondary: "#475569",
    },
    divider: "#E2E8F0",
    action: {
      active: "#16A34A",
      hover: "rgba(22, 163, 74, 0.08)",
      selected: "rgba(22, 163, 74, 0.12)",
      disabled: "#94A3B8",
      disabledBackground: "#E2E8F0",
      focus: "rgba(22, 163, 74, 0.16)",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "var(--font-geist-sans), sans-serif",
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#4ADE80",
      light: "#86EFAC",
      dark: "#15803D",
      contrastText: "#052E16",
    },
    secondary: {
      main: "#14B8A6",
      light: "#5EEAD4",
      dark: "#0F766E",
      contrastText: "#042F2E",
    },
    info: {
      main: "#60A5FA",
      light: "#BFDBFE",
      dark: "#1D4ED8",
      contrastText: "#0F172A",
    },
    ...paletteCommon,
    background: {
      default: "#f3f3f3",
      paper: "#0F172A",
    },
    text: {
      primary: "#E2E8F0",
      secondary: "#94A3B8",
    },
    divider: "#1E293B",
    action: {
      active: "#4ADE80",
      hover: "rgba(74, 222, 128, 0.08)",
      selected: "rgba(74, 222, 128, 0.12)",
      disabled: "#475569",
      disabledBackground: "#1E293B",
      focus: "rgba(74, 222, 128, 0.16)",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "var(--font-geist-sans), sans-serif",
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },
});
