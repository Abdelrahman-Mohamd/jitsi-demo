export const generateRoomName = (): string => {
  // Generate a simple alphanumeric room name to avoid any special character issues
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  // Generate a shorter, simpler room name (12 characters)
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

export const formatRoomName = (roomName: string): string => {
  return roomName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

export const validateRoomName = (roomName: string): boolean => {
  if (!roomName || roomName.trim().length === 0) {
    return false;
  }

  const formatted = formatRoomName(roomName);
  return formatted.length >= 3 && formatted.length <= 50;
};

export const createMeetingId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const getCurrentTimestamp = (): string => {
  return new Date().toLocaleString();
};

export const isJitsiLoaded = (): boolean => {
  return typeof window !== "undefined" && !!window.JitsiMeetExternalAPI;
};

export const loadJitsiScript = (domain = "meet.jit.si"): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isJitsiLoaded()) {
      console.log("Jitsi API already loaded");
      resolve();
      return;
    }

    console.log(`Creating Jitsi script element for ${domain}...`);
    const script = document.createElement("script");
    script.src = `https://${domain}/external_api.js`;
    script.async = true;
    script.crossOrigin = "anonymous";

    script.onload = () => {
      console.log(`Jitsi script onload fired for ${domain}`);
      // Wait a bit for the API to be fully loaded
      setTimeout(() => {
        if (isJitsiLoaded()) {
          console.log("Jitsi API confirmed loaded after timeout");
          resolve();
        } else {
          console.error("Jitsi API still not available after timeout");
          reject(new Error("Jitsi API failed to load properly"));
        }
      }, 500); // Increased timeout for Netlify
    };

    script.onerror = (error) => {
      console.error(`Jitsi script failed to load from ${domain}:`, error);
      reject(new Error(`Failed to load Jitsi Meet External API from ${domain}`));
    };

    console.log("Appending Jitsi script to head...");
    document.head.appendChild(script);
  });
};

// Available Jitsi servers to try as fallbacks
export const JITSI_SERVERS = [
  {
    domain: "meet.jit.si",
    name: "Jitsi Meet (Official)",
    description: "Official Jitsi server - may have waiting rooms enabled",
  },
  {
    domain: "8x8.vc",
    name: "8x8 Video Meetings",
    description: "Alternative Jitsi server by 8x8",
  },
  {
    domain: "jitsi.riot.im",
    name: "Element Jitsi",
    description: "Jitsi instance by Element (Matrix)",
  },
] as const;

export const getMeetingUrl = (
  roomName: string,
  domain = "meet.jit.si"
): string => {
  const formattedRoom = formatRoomName(roomName);
  return `https://${domain}/${formattedRoom}`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand("copy");
      document.body.removeChild(textArea);
      return result;
    }
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    return false;
  }
};

// Simple JWT generation for Jitsi authentication
// Note: This is a basic implementation for client-side use
export const generateJitsiJWT = (
  roomName: string,
  userName: string,
  isHost: boolean
): string => {
  // Create a basic JWT payload
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const payload = {
    iss: "video-conference-app",
    aud: "jitsi",
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
    nbf: Math.floor(Date.now() / 1000),
    iat: Math.floor(Date.now() / 1000),
    room: roomName,
    sub: "meet.jit.si",
    context: {
      user: {
        name: userName,
        email: `${userName.toLowerCase().replace(/\s+/g, "")}@guest.jitsi`,
        id: Math.random().toString(36).substr(2, 9),
      },
      features: {
        livestreaming: isHost,
        recording: isHost,
        transcription: isHost,
        "outbound-call": isHost,
      },
    },
    moderator: isHost,
  };

  // Simple base64 encoding (for demo purposes)
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));

  // For a real implementation, you would sign this with a secret
  // For demo purposes, we'll just return the unsigned token
  return `${encodedHeader}.${encodedPayload}.demo-signature`;
};
