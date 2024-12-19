import { useState, useEffect } from "react";
import { useZxing } from "react-zxing";
import "./App.css";

function App() {
  const [result, setResult] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { ref } = useZxing({
    onDecodeResult(result) {
      setResult(result.getText());
    },
  });

  useEffect(() => {
    const savedPassword = localStorage.getItem("password");
    if (!savedPassword) {
      setIsModalOpen(true);
    }
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter both username and password");
      return;
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: username,
          code: password,
        }),
      });

      if (response.ok) {
        localStorage.setItem("password", password);
        setIsModalOpen(false);
      } else {
        alert("Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("An error occurred. Please try again later");
    }
  };

  return (
    <div className="app">
      {isModalOpen && (
        <div className="modal">
          <div className="modal__content">
            <h2>Login</h2>
            <div className="form__group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>
            <div className="form__group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            <button className="btn" onClick={handleLogin}>
              Login
            </button>
          </div>
        </div>
      )}

      <video className="qr__video__preview" ref={ref} />
      <p className="result__text">
        <span>Last result:</span> <span>{result}</span>
      </p>
    </div>
  );
}

export default App;
