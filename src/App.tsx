import Nav from "./components/Nav"
import { ThemeProvider } from "./context/Theme"
import AppRoutes from "./routes/AppRoutes"

const App = () => {

  return (
    <ThemeProvider>
      <Nav />
      <AppRoutes />
    </ThemeProvider>
  )
}

export default App