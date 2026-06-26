import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { readClipboard, starClipboard, unstarClipboard, deleteClipboard } from "../services/clipboardApi";
import { getOwnerToken } from "../utils/tokens";
import { formatLocalTime, addMilliseconds, toUTCString } from "../utils/time";
import { API_BASE } from "../constants";
import type { ClipboardContent } from "../types";

export default function ViewPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [data, setData] = useState<ClipboardContent | null>(null);
  
  const [locked, setLocked] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  const [isOneTimeWarningShown, setIsOneTimeWarningShown] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editExpiration, setEditExpiration] = useState("1_hour");
  const [editCustomDateTime, setEditCustomDateTime] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const fetchData = useCallback(async (password?: string) => {
    if (!code) return;
    setLoading(true);
    setPasswordError(null);
    try {
      const ownerToken = getOwnerToken(code);
      const res = await readClipboard(code, { 
        ownerToken: ownerToken ?? undefined, 
        password 
      });

      if ("locked" in res) {
        setLocked(true);
      } else {
        setLocked(false);
        setData(res);
        if (res.isOneTimeView) {
          setIsOneTimeWarningShown(true);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("password")) {
        setPasswordError(msg);
      } else {
        setError(msg || "Clipboard not found or expired");
      }
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    if (code) {
      fetchData();
    }
  }, [code, fetchData]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(inputPassword);
  };

  const handleStar = async () => {
    if (!code || !data) return;
    try {
      await starClipboard(code);
      setData({ ...data, isStarred: true });
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleUnstar = async () => {
    if (!code || !data) return;
    try {
      await unstarClipboard(code);
      setData({ ...data, isStarred: false });
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!code || !data) return;
    
    let password = undefined;
    const ownerToken = getOwnerToken(code);
    
    if (data.mode === "protected" && !ownerToken) {
      const pw = window.prompt("Enter password to delete:");
      if (pw === null) return;
      password = pw;
    }
    
    try {
      await deleteClipboard(code, { ownerToken: ownerToken ?? undefined, password });
      navigate("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("password")) {
        alert("Incorrect password or unauthorized");
      } else if (msg.toLowerCase().includes("not found")) {
        alert("Already deleted");
      } else {
        alert(msg);
      }
    }
  };

  const handleEditClick = () => {
    if (!data) return;
    setEditContent(data.content);
    setEditExpiration("1_hour");
    setEditPassword("");
    setIsEditing(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !data) return;

    let expiresAt: string | null = null;
    let isOneTimeView = false;

    if (editExpiration === "infinite") {
      expiresAt = null;
    } else if (editExpiration === "one_time") {
      isOneTimeView = true;
    } else if (editExpiration === "custom") {
      if (!editCustomDateTime) {
        alert("Please provide a custom date and time");
        return;
      }
      expiresAt = toUTCString(editCustomDateTime);
    } else {
      let ms = 0;
      switch (editExpiration) {
        case "1_min": ms = 60 * 1000; break;
        case "5_min": ms = 5 * 60 * 1000; break;
        case "15_min": ms = 15 * 60 * 1000; break;
        case "1_hour": ms = 3600 * 1000; break;
        case "1_day": ms = 86400 * 1000; break;
        case "1_week": ms = 7 * 86400 * 1000; break;
        case "1_month": ms = 30 * 86400 * 1000; break;
        case "1_year": ms = 365 * 86400 * 1000; break;
      }
      expiresAt = addMilliseconds(ms);
    }

    const body: any = {};
    if (editContent !== data.content) {
      body.content = editContent;
    }
    if (isOneTimeView) {
      body.isOneTimeView = true;
    } else if (expiresAt) {
      body.expiresAt = expiresAt;
    } else if (editExpiration === "infinite") {
      body.expiresAt = null;
    }

    if (Object.keys(body).length === 0) {
      setIsEditing(false);
      return;
    }

    const ownerToken = getOwnerToken(code);
    const reqHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (ownerToken) reqHeaders["X-Owner-Token"] = ownerToken;
    
    if (!ownerToken && data.passwordMode === "edit" && editPassword) {
      reqHeaders["X-Clipboard-Password"] = editPassword;
    }

    try {
      const res = await fetch(`${API_BASE}/clipboard/${code}`, {
        method: "PUT",
        headers: reqHeaders,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json() as { error: string };
        throw new Error(err.error);
      }
      const resData = await res.json();
      
      setData({
        ...data,
        content: editContent,
        expiresAt: resData.expiresAt,
        isOneTimeView: resData.isOneTimeView,
      });
      setIsEditing(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("password") || msg.toLowerCase().includes("unauthorized") || msg.toLowerCase().includes("forbidden")) {
        alert("Incorrect password or unauthorized");
      } else {
        alert(msg);
      }
    }
  };

  if (loading && !locked && !data) {
    return <div>Loading...</div>;
  }

  if (error && !data) {
    return <div>{error}</div>;
  }

  if (locked && !data) {
    return (
      <div>
        <h2>Clipboard is Locked</h2>
        <form onSubmit={handlePasswordSubmit}>
          <label>
            Password:
            <input
              type="password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit">Submit</button>
        </form>
        {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <h2>Clipboard: {data.code}</h2>
      
      <div style={{ marginBottom: "1rem" }}>
        <p>Mode: {data.mode}</p>
        <p>Expires at: {formatLocalTime(data.expiresAt)}</p>
        <p>Starred: {data.isStarred ? "Yes" : "No"}</p>
        {isOneTimeWarningShown && (
          <p style={{ color: "orange", fontWeight: "bold" }}>
            This was a one-time view clipboard. It has been permanently deleted.
          </p>
        )}
      </div>

      <div style={{ marginBottom: "1rem" }}>
        {data.mode === "public" && (
          <>
            {!data.isStarred ? (
              <button onClick={handleStar}>Star</button>
            ) : (
              <button onClick={handleUnstar}>Unstar</button>
            )}
          </>
        )}
        {" "}
        <button onClick={handleEditClick}>Edit</button>
        {" "}
        <button onClick={handleDelete}>Delete</button>
      </div>

      <div>
        <h3>Content:</h3>
        {isEditing ? (
          <form onSubmit={handleEditSubmit}>
            {!getOwnerToken(code!) && data.passwordMode === "edit" && (
              <div style={{ marginBottom: "1rem" }}>
                <label>
                  Edit Password:
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    required
                  />
                </label>
              </div>
            )}
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              style={{ width: "100%", minHeight: "200px" }}
              required
            />
            <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
              <label>Expiration:</label><br />
              <select value={editExpiration} onChange={(e) => setEditExpiration(e.target.value)}>
                <option value="1_min">1 minute</option>
                <option value="5_min">5 minutes</option>
                <option value="15_min">15 minutes</option>
                <option value="1_hour">1 hour</option>
                <option value="1_day">1 day</option>
                <option value="1_week">1 week</option>
                <option value="1_month">1 month</option>
                <option value="1_year">1 year</option>
                {data.mode === "public" && <option value="infinite">Infinite</option>}
                <option value="one_time">One-Time View</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {editExpiration === "custom" && (
              <div style={{ marginBottom: "1rem" }}>
                <label>Custom Date/Time:</label><br />
                <input 
                  type="datetime-local" 
                  value={editCustomDateTime} 
                  onChange={(e) => setEditCustomDateTime(e.target.value)} 
                  required 
                />
              </div>
            )}
            <button type="submit">Submit</button>
            {" "}
            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
          </form>
        ) : (
          <textarea
            readOnly
            value={data.content}
            style={{ width: "100%", minHeight: "200px" }}
          />
        )}
      </div>
    </div>
  );
}
