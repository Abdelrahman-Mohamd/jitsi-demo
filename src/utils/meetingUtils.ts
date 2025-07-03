export const generateRoomName = (): string => {
  const adjectives = [
    "amazing",
    "brilliant",
    "creative",
    "dynamic",
    "elegant",
    "fantastic",
    "great",
    "incredible",
    "lovely",
    "marvelous",
    "outstanding",
    "perfect",
    "remarkable",
    "spectacular",
    "wonderful",
    "excellent",
    "awesome",
    "superb",
  ];

  const nouns = [
    "meeting",
    "conference",
    "session",
    "discussion",
    "gathering",
    "forum",
    "workshop",
    "seminar",
    "summit",
    "symposium",
    "assembly",
    "convention",
    "colloquium",
    "panel",
    "roundtable",
    "huddle",
    "standup",
    "sync",
  ];

  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 9999) + 1000;

  return `${randomAdjective}-${randomNoun}-${randomNumber}`;
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

export const loadJitsiScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isJitsiLoaded()) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;

    script.onload = () => {
      // Wait a bit for the API to be fully loaded
      setTimeout(() => {
        if (isJitsiLoaded()) {
          resolve();
        } else {
          reject(new Error("Jitsi API failed to load properly"));
        }
      }, 100);
    };

    script.onerror = () => {
      reject(new Error("Failed to load Jitsi Meet External API"));
    };

    document.head.appendChild(script);
  });
};

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
