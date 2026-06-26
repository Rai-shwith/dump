import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "../constants";
import type { StarredEntry } from "../types";
import { formatLocalTime } from "../utils/time";

export default function HomePage() {
  const [starred, setStarred] = useState<StarredEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/starred`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch starred clipboards");
        return res.json();
      })
      .then((data: { starred: StarredEntry[] }) => {
        setStarred(data.starred);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div>
      <h1>Dump</h1>
      <Link to="/new">Create new clipboard</Link>

      <h2>Starred Clipboards</h2>

      {isLoading && <p>Loading...</p>}

      {error && <p>Error: {error}</p>}

      {!isLoading && !error && starred.length === 0 && (
        <p>No starred clipboards yet</p>
      )}

      {!isLoading && !error && starred.length > 0 && (
        <ul>
          {starred.map((clip) => (
            <li key={clip.code}>
              <Link to={`/${clip.code}`}>{clip.code}</Link>
              <span> - Expires: {formatLocalTime(clip.expiresAt)}</span>
              {clip.isOneTimeView && <span> (One-time view)</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
