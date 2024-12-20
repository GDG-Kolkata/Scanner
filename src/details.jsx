import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import "./Details.css";
import { SERVER_URL } from "./constants";



export default function Details() {
  const { scannedData } = useParams();
  const [attendeeData, setAttendeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [switches, setSwitches] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttendeeData = async () => {
      try {
        setLoading(true);
        setError(null);

        const scannedDataJson = JSON.parse(decodeURIComponent(scannedData));

        const response = await fetch(
          `${SERVER_URL}${encodeURIComponent(
            atob(scannedDataJson["userId"])
          )}`
        );

        if (!response.ok) {
          throw new Error(
            response.status === 400
              ? "Invalid attendee ID"
              : "Failed to fetch attendee data"
          );
        }

        const data = await response.json();

        setAttendeeData(data);

        setAttendeeData(data);

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
      const scannedDataJson = JSON.parse(decodeURIComponent(scannedData));

      const _switches = {
        ...switches,
      };

      Object.keys(_switches).forEach((key) => {
        if (_switches[key] === false) {
          delete _switches[key];
        }
      });

      const response = await fetch(
        `${SERVER_URL}${atob(
          scannedDataJson["userId"]
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requested_by: window.localStorage.getItem("password"),
            ..._switches,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update attendance");
      } else {
        navigate("/");
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
      <div
        className="item"
        style={{
          display: "flex",
          alignItems: "start",
          gapY: "1rem",
          flexDirection: "column",
          backgroundColor: "#ffe7a5",
        }}
      >
        <h2 className="name">{`${attendeeData["name"]} (${attendeeData["gender"]})`}</h2>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <h3 className="email">
            <a
              style={{
                color: "blue",
                textDecoration: "none",
              }}
              href={`mailto:${attendeeData["email"]}`}
            >
              {attendeeData["email"]}
            </a>
          </h3>
          <h3 className="phone">
            <a
              style={{
                color: "blue",
                textDecoration: "none",
              }}
              href={`tel:${attendeeData["phone"]}`}
            >
              {attendeeData["phone"]}
            </a>
          </h3>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <p>{`Food: ${attendeeData["foodPreference"]}`}</p>
          <p>{`T-Shirt: ${attendeeData["tshirtSize"]}`}</p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <p>{`Age: ${attendeeData["age"]}`}</p>
          <p>{`City: ${attendeeData["city"]}`}</p>
        </div>
      </div>

      {attendeeData["organisationDetails"] ? (
        <div
          style={{
            backgroundColor: "#f8d8d8",
          }}
          className="item"
        >
          <p>{`${attendeeData["organisationDetails"]["designation"]}, ${attendeeData["organisationDetails"]["name"]}`}</p>
        </div>
      ) : null}

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
