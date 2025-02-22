import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import { ThemeProvider } from "@/theme"
import "./theme/theme.css"
import ThemedTest from "./ThemedTest.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      {/* <ThemedTest /> */}
       <App />
    </ThemeProvider>
  </StrictMode>

// <ThemeProvider
// config={{
//     mode: 'dark',
//     colorScheme: 'ocean',
//     useSystemColorScheme: true,
//     storage: {
//         type: 'localStorage',
//         prefix: 'my-app-theme'
//     },
//     transition: {
//         duration: 300
//     }
// }}
// className="theme-wrapper"
// onThemeChange={({ mode, colorScheme }) => {
//     console.log(`Theme changed to ${mode} mode with ${colorScheme} scheme`);
// }}
// >
// <App />
// </ThemeProvider>
)
