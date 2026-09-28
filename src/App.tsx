import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Profile from "./pages/Profile"
import { useState,useEffect} from "react"

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
  path="/"
  element={
    <>
      {isLoggedIn && (
        <Navbar
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
        />
      )}
      <Home />
    </>
  }
/>

        <Route
          path="/login"
          element={<Login setIsLoggedIn={setIsLoggedIn} />}
        />

        <Route
          path="/profile"
          element={
            <>
              {isLoggedIn && (
                <Navbar
                  isLoggedIn={isLoggedIn}
                  setIsLoggedIn={setIsLoggedIn}
                />
              )}
              <Profile />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App