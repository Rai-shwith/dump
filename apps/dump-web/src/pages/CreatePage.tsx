import React, { useState, useEffect } from "react";

import { createClipboard, starClipboard } from "../services/clipboardApi";
import { generateCode } from "../utils/codegen";
import { addMilliseconds, toUTCString } from "../utils/time";
import { setOwnerToken } from "../utils/tokens";
import type { ClipboardMode, PasswordMode, CreateClipboardRequest } from "../types";

export default function CreatePage() {
  const [content, setContent] = useState("");
  const [code, setCode] = useState("");
  const [codePlaceholder, setCodePlaceholder] = useState("");
  const [mode, setMode] = useState<ClipboardMode>("public");
  const [passwordMode, setPasswordMode] = useState<PasswordMode>("view");
  const [password, setPassword] = useState("");
  const [expiration, setExpiration] = useState("1_hour");
  const [customDateTime, setCustomDateTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isStarred, setIsStarred] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  useEffect(() => {
    setCodePlaceholder(generateCode(8));
  }, []);

  const handleRegenerateCode = () => {
    setCodePlaceholder(generateCode(8));
  };

  const handleCreateAnother = () => {
    setCreatedCode(null);
    setContent("");
    setCode("");
    setPassword("");
    setCustomDateTime("");
    setIsStarred(false);
  };

  if (createdCode) {
    const url = `${window.location.origin}/${createdCode}`;
    return (
      <div>
        <h1>Clipboard Created!</h1>
        <p>Your clipboard is ready at:</p>
        <p>
          <a href={url}>{url}</a>
        </p>
        <br />
        <button type="button" onClick={handleCreateAnother}>Create Another</button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let expiresAt: string | null = null;
    let isOneTimeView = false;

    if (expiration === "infinite") {
      expiresAt = null;
    } else if (expiration === "one_time") {
      isOneTimeView = true;
    } else if (expiration === "custom") {
      if (!customDateTime) {
        setError("Please provide a custom date and time");
        return;
      }
      expiresAt = toUTCString(customDateTime);
    } else {
      let ms = 0;
      switch (expiration) {
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

    const body: CreateClipboardRequest = {
      content,
      mode,
    };

    if (code.trim()) {
      body.code = code.trim().toLowerCase();
    }

    if (mode === "protected") {
      body.passwordMode = passwordMode;
      body.password = password;
    }

    if (expiresAt) {
      body.expiresAt = expiresAt;
    }
    if (isOneTimeView) {
      body.isOneTimeView = true;
    }

    try {
      const res = await createClipboard(body);
      setOwnerToken(res.code, res.ownerToken);
      if (mode === "public" && isStarred) {
        try {
          await starClipboard(res.code);
        } catch (err) {
          console.error("Failed to star clipboard", err);
        }
      }
      setCreatedCode(res.code);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  };

  return (
    <div>
      <h1>Create Clipboard</h1>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Content (required):</label><br />
          <textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            required 
          />
        </div>
        
        <div>
          <label>Code (optional):</label><br />
          <input 
            type="text" 
            value={code} 
            onChange={(e) => setCode(e.target.value)} 
            placeholder={codePlaceholder}
          />
          <button type="button" onClick={handleRegenerateCode}>Regenerate</button>
        </div>
        
        <div>
          <label>Mode:</label><br />
          <select 
            value={mode} 
            onChange={(e) => {
              const newMode = e.target.value as ClipboardMode;
              setMode(newMode);
              if (newMode !== "public" && expiration === "infinite") {
                setExpiration("1_hour");
              }
            }}
          >
            <option value="public">Public</option>
            <option value="protected">Protected</option>
          </select>
        </div>
        
        {mode === "public" && (
          <div title="Star this clipboard so it appears on the global public homepage">
            <label>
              <input 
                type="checkbox" 
                checked={isStarred} 
                onChange={(e) => setIsStarred(e.target.checked)} 
              />
              Star this clipboard
            </label>
          </div>
        )}
        
        {mode === "protected" && (
          <div>
            <label>Password Mode:</label><br />
            <select value={passwordMode} onChange={(e) => setPasswordMode(e.target.value as PasswordMode)}>
              <option value="view">View</option>
              <option value="edit">Edit</option>
            </select>
            <br />
            <label>Password:</label><br />
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>
        )}
        
        <div>
          <label>Expiration:</label><br />
          <select value={expiration} onChange={(e) => setExpiration(e.target.value)}>
            <option value="1_min">1 minute</option>
            <option value="5_min">5 minutes</option>
            <option value="15_min">15 minutes</option>
            <option value="1_hour">1 hour</option>
            <option value="1_day">1 day</option>
            <option value="1_week">1 week</option>
            <option value="1_month">1 month</option>
            <option value="1_year">1 year</option>
            {mode === "public" && <option value="infinite">Infinite</option>}
            <option value="one_time">One-Time View</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        
        {expiration === "custom" && (
          <div>
            <label>Custom Date/Time:</label><br />
            <input 
              type="datetime-local" 
              value={customDateTime} 
              onChange={(e) => setCustomDateTime(e.target.value)} 
              required 
            />
          </div>
        )}
        
        <br />
        <button type="submit">Create</button>
      </form>
    </div>
  );
}
