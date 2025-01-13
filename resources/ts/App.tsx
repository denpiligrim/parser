import { CssBaseline, Grid2 as Grid, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import style from '../sass/app.scss?inline';
import Main from './Pages/Main';
import { useEffect } from 'react';

declare module '@mui/material/styles' {
  interface PaletteColor {
    primaryLight?: string;
  }
  interface SimplePaletteColorOptions {
    primaryLight?: string;
  }
  interface BreakpointOverrides {
    xxl: true;
  }
}

function App() {

  const newTheme = createTheme({
    palette: {
      primary: {
        main: '#ff0000',
        light: '#8a93ca',
        primaryLight: '#535fab'
      }
    },
    typography: {
      fontFamily: [
        "Roboto",
        'serif'
      ].join(',')
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
        xxl: 1800
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: style,
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: '15px',
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: '#ff0000'
            },
            "& input::placeholder": {
              verticalAlign: 'middle'
            }
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.092), rgba(255, 255, 255, 0.092))',
            borderRadius: '15px'
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '40px',
            padding: '6px 26px'
          }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paperWidthMd: {
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          },
          paperFullScreen: {
            borderRadius: '0'
          }
        }
      }
    }
  });

  useEffect(() => {
    setTimeout(() => {
      console.clear();
      console.log("%cText me on Telegram:", "color: black; font-size: 16px; font-weight: bold");
      console.log("%c@denpiligrim", "color: #207BB2; font-size: 16px; font-weight: bold");
    }, 1000);
  }, []);

  return (
    <BrowserRouter>
        <ThemeProvider theme={newTheme}>
          <style>{`
            :root {
                --primary-main: ${newTheme.palette.primary.main};
            }
        `}</style>
          <CssBaseline />
          <Grid container sx={{ my: 'auto' }}>
            <Grid size={{ xs: 12 }} minHeight={300}>
              <Routes>
                <Route path='/' element={<Main />} />
              </Routes>
            </Grid>
          </Grid>
        </ThemeProvider>
    </BrowserRouter>
  )
}

export default App