import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Profile from "./pages/Profile"
import { useEffect, useState } from "react"
import ProtectedRoute from "./routes/ProtectedRoute"
import ProtectedLayout from "./routes/ProtectedLayout"
import Signup from "./pages/Signup"
import Welcome from "./pages/Welcome"
import { bootstrapAuth } from "./api/axios"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    bootstrapAuth().then((success) => {
      setIsLoggedIn(success)
      setIsCheckingAuth(false)
    })
  }, [])

  if (isCheckingAuth) {
    
    return null
  }

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={<Login setIsLoggedIn={setIsLoggedIn} />}
        />

        <Route
          path="/signup"
          element={<Signup setIsLoggedIn={setIsLoggedIn} />}
        />

        <Route element={<ProtectedRoute isLoggedIn={isLoggedIn} />}>

          <Route path="/welcome" element={<Welcome />} />

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