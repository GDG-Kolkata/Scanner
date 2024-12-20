import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import "./Details.css";

export default function Details() {
  const { scannedData } = useParams();
  const [attendeeData, setAttendeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [switches, setSwitches] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();

  const mockAttendeeData = {
    _id: "attendeeId",
    name: "John Doe",
    email: "john.doe@example.com",
    check_in: false,
    swag: false,
    food: true,
    check_in_updatedAt: "2024-12-20T10:00:00.000Z",
    swag_updatedAt: "2024-12-20T11:00:00.000Z",
    food_updatedAt: "2024-12-20T12:00:00.000Z",
    check_in_updatedBy: "requested_by_email",
    swag_updatedBy: "requested_by_email",
    food_updatedBy: "requested_by_email",
  };

  useEffect(() => {
    const fetchAttendeeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // const response = await fetch(
        //   `/attendee/?user_id=${encodeURIComponent(
        //     scannedData
        //   )}&requested_by=YOUR_ACCESS_CODE`
        // );

        // if (!response.ok) {
        //   throw new Error(
        //     response.status === 400
        //       ? "Invalid attendee ID"
        //       : "Failed to fetch attendee data"
        //   );
        // }

        // const data = await response.json();
        // setAttendeeData(data);

        const data = mockAttendeeData;

        setAttendeeData(data);

        // Initialize switches for items without datetime
        const initialSwitches = {};
        Object.entries(data).forEach(([key, value]) => {
          if (!value) {
            initialSwitches[key] = false;
          }
        });
        setSwitches(initialSwitches);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (scannedData) {
      const savedPassword = localStorage.getItem("password");
      if (!savedPassword) {
        navigate("/");
      } else {
        fetchAttendeeData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannedData]);

  const handleSwitchChange = (key) => {
    setSwitches((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setHasChanges(true);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await fetch("/attendee/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: scannedData,
          updates: switches,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update attendance");
      }

      setHasChanges(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return null;
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };

  if (loading) {
    return <div className="loading-spinner">{<Loader2 />}</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!attendeeData) {
    return null;
  }

  return (
    <div className="details-container">
      <h2 className="name">{attendeeData["name"]}</h2>
      <h3 className="email">{attendeeData["email"]}</h3>

      {attendeeData["check_in"] ? (
        <div className="item">
          <span>Check In</span>
          <span className="time">
            {formatDateTime(attendeeData["check_in_updatedAt"])}
          </span>
        </div>
      ) : (
        <div className="item switch__item">
          Check In
          <label className="switch">
            <input
              type="checkbox"
              checked={switches["check_in"] || false}
              onChange={() => handleSwitchChange("check_in")}
            />
            <span className="slider"></span>
          </label>
        </div>
      )}

      {attendeeData["swag"] ? (
        <div className="item">
          <span>Swag</span>
          <span className="time">
            {formatDateTime(attendeeData["swag_updatedAt"])}
          </span>
        </div>
      ) : (
        <div className="item switch__item">
          Swag
          <label className="switch">
            <input
              type="checkbox"
              checked={switches["swag"] || false}
              onChange={() => handleSwitchChange("swag")}
            />
            <span className="slider"></span>
          </label>
        </div>
      )}

      {attendeeData["food"] ? (
        <div className="item">
          <span>Food</span>
          <span className="time">
            {formatDateTime(attendeeData["food_updatedAt"])}
          </span>
        </div>
      ) : (
        <div className="item switch__item">
          Food
          <label className="switch">
            <input
              type="checkbox"
              checked={switches["food"] || false}
              onChange={() => handleSwitchChange("food")}
            />
            <span className="slider"></span>
          </label>
        </div>
      )}

      {hasChanges && (
        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Updating..." : "Submit Changes"}
        </button>
      )}
    </div>
  );
}
