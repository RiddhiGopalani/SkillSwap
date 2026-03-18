import { useState } from "react";
import Landing from "./pages/Landing";
import Profile from "./pages/Profile";
import "./styles.css";

function App() {
  const [page, setPage] = useState("landing");
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className={theme}>
      {page === "landing" && (
        <Landing 
          goToProfile={() => setPage("profile")} 
          toggleTheme={toggleTheme}
          theme={theme}
        />
      )}

      {page === "profile" && <Profile />}
    </div>
  );
}

export default App;
