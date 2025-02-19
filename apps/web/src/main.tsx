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
)
