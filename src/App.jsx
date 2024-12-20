import { useState, useEffect } from "react";
import { useZxing } from "react-zxing";
import "./App.css";
import { useNavigate } from "react-router-dom";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const navigate = useNavigate();

  const { ref, stop, start } = useZxing({
    onDecodeResult(result) {
      const scannedText = result.getText();
      navigate(`/result/${scannedText}`);
    },
    paused: isModalOpen || !isCameraActive,
  });

  useEffect(() => {
    const savedPassword = localStorage.getItem("password");
    if (!savedPassword) {
      setIsModalOpen(true);
      setIsCameraActive(false);
    } else {
      setIsCameraActive(true);
    }

    return () => {
      if (stop) stop();
    };
  }, [stop]);

  useEffect(() => {
    if (!isModalOpen && start) {
      setIsCameraActive(true);
      start();
    } else if (isModalOpen && stop) {
      setIsCameraActive(false);
      stop();
    }
  }, [isModalOpen, start, stop]);

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter both username and password");
      return;
    }

    try {
      const response = await fetch(
        `https://devfest-internal.vercel.app/generate_session/?email=${username}&code=${password}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        localStorage.setItem("password", password);
        setIsModalOpen(false);
        setIsCameraActive(true);
        if (start) start();
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

      {isModalOpen ? null : <video className="qr__video__preview" ref={ref} />}
    </div>
  );
}

export default App;
