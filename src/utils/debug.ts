// Debug utilities for production deployment
export const debugInfo = () => {
  console.log("Debug Info:", {
    isSecureContext: window.isSecureContext,
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    userAgent: navigator.userAgent,
    hasGetUserMedia: !!(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    ),
    jitsiApiLoaded: !!window.JitsiMeetExternalAPI,
    currentTime: new Date().toISOString(),
  });
};

export const testCameraAccess = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    console.log("Camera/microphone test: SUCCESS");
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (error) {
    console.error("Camera/microphone test: FAILED", error);
    return false;
  }
};

export const checkJitsiAvailability = () => {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      if (window.JitsiMeetExternalAPI) {
        clearInterval(checkInterval);
        console.log("Jitsi API available");
        resolve(true);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(checkInterval);
      console.log("Jitsi API timeout");
      resolve(false);
    }, 10000);
  });
};
