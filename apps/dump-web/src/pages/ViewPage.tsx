import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { readClipboard, starClipboard, unstarClipboard } from "../services/clipboardApi";
import { getOwnerToken } from "../utils/tokens";
import { formatLocalTime } from "../utils/time";
import type { ClipboardContent } from "../types";

export default function ViewPage() {
  const { code } = useParams<{ code: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [data, setData] = useState<ClipboardContent | null>(null);
  
  const [locked, setLocked] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  const [isOneTimeWarningShown, setIsOneTimeWarningShown] = useState(false);

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
        <button disabled>Edit</button>
        {" "}
        <button disabled>Delete</button>
      </div>

      <div>
        <h3>Content:</h3>
        <textarea
          readOnly
          value={data.content}
          style={{ width: "100%", minHeight: "200px" }}
        />
      </div>
    </div>
  );
}
