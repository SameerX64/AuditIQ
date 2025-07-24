import React, { createContext, useContext, useState, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const CustomThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : true; // Default to dark mode
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: darkMode ? "#90caf9" : "#1976d2",
        light: darkMode ? "#e3f2fd" : "#42a5f5",
        dark: darkMode ? "#42a5f5" : "#1565c0",
      },
      secondary: {
        main: darkMode ? "#f48fb1" : "#dc004e",
        light: darkMode ? "#fce4ec" : "#ff5983",
        dark: darkMode ? "#f06292" : "#9a0036",
      },
      background: {
        default: darkMode ? "#121212" : "#fafafa",
        paper: darkMode ? "#1e1e1e" : "#ffffff",
      },
      text: {
        primary: darkMode ? "#ffffff" : "#000000",
        secondary: darkMode ? "#b0b0b0" : "#666666",
      },
      error: {
        main: darkMode ? "#f44336" : "#d32f2f",
      },
      warning: {
        main: darkMode ? "#ff9800" : "#ed6c02",
      },
      info: {
        main: darkMode ? "#2196f3" : "#0288d1",
      },
      success: {
        main: darkMode ? "#4caf50" : "#2e7d32",
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 300,
        fontSize: "2.5rem",
      },
      h2: {
        fontWeight: 400,
        fontSize: "2rem",
      },
      h3: {
        fontWeight: 500,
        fontSize: "1.75rem",
      },
      h4: {
        fontWeight: 500,
        fontSize: "1.5rem",
      },
      h5: {
        fontWeight: 500,
        fontSize: "1.25rem",
      },
      h6: {
        fontWeight: 500,
        fontSize: "1rem",
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? "#1e1e1e" : "#1976d2",
            color: darkMode ? "#ffffff" : "#ffffff",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? "#2e2e2e" : "#ffffff",
            borderRadius: 12,
            boxShadow: darkMode
              ? "0 4px 6px rgba(0, 0, 0, 0.3)"
              : "0 2px 4px rgba(0, 0, 0, 0.1)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? "#2e2e2e" : "#ffffff",
            borderRadius: 8,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: "none",
            fontWeight: 500,
          },
          contained: {
            boxShadow: darkMode
              ? "0 3px 6px rgba(0, 0, 0, 0.3)"
              : "0 2px 4px rgba(0, 0, 0, 0.1)",
            "&:hover": {
              boxShadow: darkMode
                ? "0 4px 8px rgba(0, 0, 0, 0.4)"
                : "0 3px 6px rgba(0, 0, 0, 0.15)",
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              backgroundColor: darkMode ? "#3e3e3e" : "#ffffff",
              "& fieldset": {
                borderColor: darkMode ? "#555555" : "#e0e0e0",
              },
              "&:hover fieldset": {
                borderColor: darkMode ? "#777777" : "#b0b0b0",
              },
              "&.Mui-focused fieldset": {
                borderColor: darkMode ? "#90caf9" : "#1976d2",
              },
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
            borderRight: `1px solid ${darkMode ? "#333333" : "#e0e0e0"}`,
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: "4px 8px",
            "&:hover": {
              backgroundColor: darkMode ? "#333333" : "#f5f5f5",
            },
            "&.Mui-selected": {
              backgroundColor: darkMode ? "#444444" : "#e3f2fd",
              "&:hover": {
                backgroundColor: darkMode ? "#555555" : "#bbdefb",
              },
            },
          },
        },
      },
    },
  });

  const value = {
    darkMode,
    toggleDarkMode,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default CustomThemeProvider;
