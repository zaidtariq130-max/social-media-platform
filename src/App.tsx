import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Profile from "./pages/Profile"
import { useState, useEffect } from "react"
import ProtectedRoute from "./routes/ProtectedRoute"
import ProtectedLayout from "./routes/ProtectedLayout"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true"
  })

  useEffect(() => {
    localStorage.setItem("isLoggedIn", String(isLoggedIn))
  }, [isLoggedIn])

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={<Login setIsLoggedIn={setIsLoggedIn} />}
        />

        <Route element={<ProtectedRoute isLoggedIn={isLoggedIn} />}>
          <Route
            element={
              <ProtectedLayout
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
              />
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App