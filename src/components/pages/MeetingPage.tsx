import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../ui/Button";
import { Loading } from "../ui/Loading";
import { ServerSelector } from "../ui/ServerSelector";
import { useAppStore } from "../../store/appStore";
import {
  loadJitsiScript,
  getMeetingUrl,
  copyToClipboard,
} from "../../utils/meetingUtils";
import type { JitsiConfig } from "../../types/jitsi";

export const MeetingPage: React.FC = () => {
  const { roomName } = useParams<{ roomName: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);
  const [containerMounted, setContainerMounted] = useState(false);

  const {
    userName,
    userEmail,
    userRole,
    jitsiApi,
    setJitsiApi,
    setIsInMeeting,
    isLoading,
    setLoading,
    error,
    setError,
    leaveMeeting,
    isChatOpen,
    isScreenSharing,
    isAudioMuted,
    isVideoMuted,
    toggleChat,
    toggleScreenSharing,
    toggleAudio,
    toggleVideo,
    currentJitsiServer,
    setCurrentJitsiServer,
    showServerSelection,
    setShowServerSelection,
  } = useAppStore();

  const [participants, setParticipants] = useState(0);
  const [meetingUrl, setMeetingUrl] = useState("");
  const [showControls, setShowControls] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("connecting");

  const isHost = searchParams.get("host") === "true" || userRole === "host";

  // Callback ref to track when container is mounted
  const setJitsiContainerRef = (element: HTMLDivElement | null) => {
    jitsiContainerRef.current = element;
    if (element) {
      console.log("Container mounted via callback ref");
      setContainerMounted(true);
    } else {
      console.log("Container unmounted via callback ref");
      setContainerMounted(false);
    }
  };

  // Log component render
  console.log("MeetingPage rendering:", {
    roomName,
    userName,
    containerMounted,
    isInitialized,
    isLoading,
    error: !!error,
  });

  useEffect(() => {
    if (!roomName) {
      navigate("/");
      return;
    }

    if (!userName.trim()) {
      navigate("/");
      return;
    }

    const url = getMeetingUrl(roomName, currentJitsiServer);
    setMeetingUrl(url);
  }, [roomName, userName, navigate, currentJitsiServer]);

  // Separate effect for Jitsi initialization that waits for container
  useEffect(() => {
    if (!roomName || !userName.trim() || isInitialized || !containerMounted) {
      console.log("Initialization blocked:", {
        roomName: !!roomName,
        userName: !!userName.trim(),
        isInitialized,
        containerMounted,
      });
      return;
    }

    const initializeJitsi = async () => {
      // Store container reference at the start to prevent it from being lost during re-renders
      const containerElement =
        jitsiContainerRef.current ||
        (document.getElementById("jitsi-container") as HTMLDivElement);

      if (!containerElement) {
        console.log("No container element found at initialization start");
        return;
      }

      try {
        console.log("Starting Jitsi initialization...");
        setConnectionStatus("initializing");
        console.log("DOM debugging:", {
          containerRef: !!jitsiContainerRef.current,
          containerById: !!document.getElementById("jitsi-container"),
          bodyChildren: document.body.children.length,
          documentReady: document.readyState,
        });

        // Set these states after getting the container reference
        setIsInitialized(true);
        setLoading(true);
        setError(null);

        // Check if we're in a secure context (required for camera/microphone)
        if (!window.isSecureContext) {
          throw new Error("HTTPS is required for camera and microphone access");
        }

        console.log(`Loading Jitsi script for ${currentJitsiServer}...`);
        setConnectionStatus("loading");
        await loadJitsiScript(currentJitsiServer);
        console.log("Jitsi script loaded successfully");

        // Verify container is still available (use the stored reference)
        const currentContainer = containerElement.isConnected
          ? containerElement
          : jitsiContainerRef.current ||
            (document.getElementById("jitsi-container") as HTMLDivElement);

        if (!currentContainer) {
          throw new Error("Jitsi container lost during initialization");
        }

        console.log("Container found and ready:", {
          storedContainer: !!containerElement,
          storedConnected: containerElement.isConnected,
          currentContainer: !!currentContainer,
          viaRef: !!jitsiContainerRef.current,
          viaId: !!document.getElementById("jitsi-container"),
        });

        if (roomName) {
          console.log("Setting up Jitsi container...");
          // Clear any existing content
          currentContainer.innerHTML = "";

          const config: JitsiConfig = {
            width: "100%",
            height: "100%",
            parentNode: currentContainer,
            roomName: roomName,
            configOverwrite: {
              startWithAudioMuted: !isHost,
              startWithVideoMuted: false,
              enableWelcomePage: false,
              prejoinPageEnabled: false,
              startScreenSharing: false,
              enableEmailInStats: false,
              // Basic P2P configuration
              enableP2P: true,
              // Minimal lobby configuration - note: these may be overridden by server
              enableLobby: false,
              requireDisplayName: false,
            },
            interfaceConfigOverwrite: {
              SHOW_JITSI_WATERMARK: false,
              SHOW_WATERMARK_FOR_GUESTS: false,
              SHOW_BRAND_WATERMARK: false,
              SHOW_CHROME_EXTENSION_BANNER: false,
              DEFAULT_REMOTE_DISPLAY_NAME: "Participant",
              DEFAULT_LOCAL_DISPLAY_NAME: userName || "You",
              MOBILE_APP_PROMO: false,
              NATIVE_APP_NAME: "Video Conference",
              PROVIDER_NAME: "Video Conference",
              SHOW_DEEP_LINKING_IMAGE: false,
            },
            userInfo: {
              displayName: userName,
              email: userEmail || undefined,
            },
          };

          // Ensure the API is available
          if (!window.JitsiMeetExternalAPI) {
            throw new Error("Jitsi Meet External API not loaded");
          }

          console.log("Creating Jitsi API instance...");
          console.log("Room name:", roomName);
          console.log("User:", userName, "Is host:", isHost);
          console.log("Server:", currentJitsiServer);

          // Use the current selected server
          const api = new window.JitsiMeetExternalAPI(currentJitsiServer, config);
          setJitsiApi(api);

          // Set a timeout to detect if connection hangs
          const connectionTimeout = setTimeout(() => {
            console.log("Connection timeout - showing server selection");
            setConnectionStatus("timeout");
            setShowServerSelection(true);
            setError(
              `Connection to ${currentJitsiServer} timed out. This may be due to network issues or server-side restrictions. Please try a different server.`
            );
          }, 15000); // 15 second timeout

          // Add connection event listeners
          api.addListener("connectionFailed", (error) => {
            console.error("Jitsi connection failed:", error);
            clearTimeout(connectionTimeout); // Clear timeout on explicit failure

            // Check if it's a membersOnly error and show server selection
            if (
              error &&
              typeof error === "object" &&
              "name" in error &&
              (error as { name: string }).name ===
                "conference.connectionError.membersOnly"
            ) {
              console.log(
                "Detected membersOnly error, showing server selection..."
              );
              setConnectionStatus("membersOnly");
              setShowServerSelection(true);
              setError(
                `Connection failed: waiting room is enabled on ${currentJitsiServer}. Try an alternative server or ask the host to disable the waiting room.`
              );
              return; // Don't set generic error
            }

            setConnectionStatus("failed");
            setShowServerSelection(true);
            setError(
              `Failed to connect to ${currentJitsiServer}. Please try again or select a different server.`
            );
          });

          // Add specific listener for conference errors
          api.addListener("conferenceError", (error) => {
            console.error("Conference error:", error);
            clearTimeout(connectionTimeout); // Clear timeout on explicit error

            if (
              error &&
              typeof error === "object" &&
              "name" in error &&
              (error as { name: string }).name ===
                "conference.connectionError.membersOnly"
            ) {
              console.log("Conference membersOnly error detected");
              setConnectionStatus("membersOnly");
              setShowServerSelection(true);
              setError(
                `Waiting room is enabled on ${currentJitsiServer}. Please try an alternative server or ask the host to admit you.`
              );
            }
          });

          api.addListener("conferenceLeft", () => {
            console.log("Conference left");
            setConnectionStatus("disconnected");
            setIsInMeeting(false);
          });

          api.addListener("conferenceJoined", () => {
            console.log("Conference joined successfully");
            clearTimeout(connectionTimeout); // Clear timeout on successful join
            setConnectionStatus("connected");
            setIsInMeeting(true);
            setError(null); // Clear any previous errors

            // Add additional video forcing after conference joins
            setTimeout(() => {
              const container = document.getElementById("jitsi-container");
              const iframe = container?.querySelector("iframe");

              if (iframe) {
                console.log(
                  "Re-forcing iframe video visibility after conference join..."
                );
                iframe.style.cssText = `
                  width: 100vw !important;
                  height: 100vh !important;
                  border: none !important;
                  position: fixed !important;
                  top: 0 !important;
                  left: 0 !important;
                  z-index: 1000 !important;
                  display: block !important;
                  visibility: visible !important;
                  opacity: 1 !important;
                  background: #000 !important;
                `;
              }
            }, 1000);
          });

          api.addListener("readyToClose", () => {
            console.log("Meeting ready to close");
            setConnectionStatus("closing");
            leaveMeeting();
            navigate("/");
          }); // Wait a moment and check if iframe was created
          setTimeout(() => {
            const container = currentContainer.isConnected
              ? currentContainer
              : document.getElementById("jitsi-container");
            const iframe = container?.querySelector("iframe");

            // Force iframe to take full size if it exists
            if (iframe) {
              // More aggressive iframe styling
              iframe.style.cssText = `
                width: 100vw !important;
                height: 100vh !important;
                border: none !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                z-index: 1 !important;
                min-width: 100vw !important;
                min-height: 100vh !important;
                max-width: 100vw !important;
                max-height: 100vh !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                background: #000 !important;
              `;

              // Also force any nested elements to be visible
              const iframeDoc =
                iframe.contentDocument || iframe.contentWindow?.document;
              if (iframeDoc) {
                const style = iframeDoc.createElement("style");
                style.textContent = `
                  body { margin: 0 !important; padding: 0 !important; }
                  .videocontainer, .filmstrip, .large-video-container { 
                    display: block !important; 
                    visibility: visible !important; 
                    opacity: 1 !important;
                  }
                `;
                iframeDoc.head.appendChild(style);
              }
            }

            // Also ensure container has proper dimensions
            if (container) {
              container.style.cssText = `
                width: 100vw !important;
                height: 100vh !important;
                min-width: 100vw !important;
                min-height: 100vh !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                z-index: 1 !important;
                background: #000 !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
              `;
            }

            console.log("Iframe check:", {
              iframe: !!iframe,
              iframeSrc: iframe?.src || "none",
              iframeStyle: iframe
                ? {
                    width: iframe.style.width,
                    height: iframe.style.height,
                    display: iframe.style.display,
                    position: iframe.style.position,
                    zIndex: iframe.style.zIndex,
                    visibility: iframe.style.visibility,
                    opacity: iframe.style.opacity,
                  }
                : "none",
              containerChildren: container?.children.length,
              containerRect: container?.getBoundingClientRect(),
              containerHTML: container?.innerHTML.substring(0, 200),
            });
          }, 1000);

          // Add a recurring check to force iframe visibility
          intervalRef.current = setInterval(() => {
            const container = document.getElementById("jitsi-container");
            const iframe = container?.querySelector("iframe");

            if (iframe && iframe.style.width !== "100vw") {
              console.log("Re-applying iframe styles...");
              iframe.style.cssText = `
                width: 100vw !important;
                height: 100vh !important;
                border: none !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                z-index: 1 !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                background: #000 !important;
              `;
            }

            // Also try to force video elements to be visible
            if (iframe) {
              try {
                const iframeDoc =
                  iframe.contentDocument || iframe.contentWindow?.document;
                if (iframeDoc) {
                  // Force all video elements to be visible
                  const videos = iframeDoc.querySelectorAll("video");
                  videos.forEach((video) => {
                    video.style.cssText = `
                      display: block !important;
                      visibility: visible !important;
                      opacity: 1 !important;
                      width: 100% !important;
                      height: 100% !important;
                      object-fit: cover !important;
                    `;
                  });

                  // Force video containers to be visible
                  const containers = iframeDoc.querySelectorAll(
                    ".videocontainer, .large-video-container, .filmstrip, .large-video, #largeVideoContainer, #dominantSpeaker"
                  );
                  containers.forEach((container) => {
                    (container as HTMLElement).style.cssText = `
                      display: block !important;
                      visibility: visible !important;
                      opacity: 1 !important;
                      width: 100% !important;
                      height: 100% !important;
                    `;
                  });
                }
              } catch {
                // Ignore cross-origin errors
              }
            }
          }, 2000);

          console.log("Setting up event listeners...");
          // Event listeners
          api.addListener("participantJoined", () => {
            console.log("Participant joined");
            setParticipants((prev) => prev + 1);
          });
          api.addListener("participantLeft", () => {
            console.log("Participant left");
            setParticipants((prev) => Math.max(0, prev - 1));
          });
          api.addListener("videoConferenceJoined", () => {
            console.log("Video conference joined");
            setParticipants(1); // Include self

            // Force iframe video elements to be visible after joining
            setTimeout(() => {
              const container = document.getElementById("jitsi-container");
              const iframe = container?.querySelector("iframe");

              if (iframe) {
                try {
                  const iframeDoc =
                    iframe.contentDocument || iframe.contentWindow?.document;
                  if (iframeDoc) {
                    console.log(
                      "Injecting video visibility CSS into iframe..."
                    );

                    // Remove any existing injected styles
                    const existingStyle = iframeDoc.getElementById(
                      "forced-video-styles"
                    );
                    if (existingStyle) {
                      existingStyle.remove();
                    }

                    // Inject new styles
                    const style = iframeDoc.createElement("style");
                    style.id = "forced-video-styles";
                    style.textContent = `
                      /* Force all video elements to be visible */
                      video {
                        display: block !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                        width: 100% !important;
                        height: 100% !important;
                        object-fit: cover !important;
                        background: #000 !important;
                      }
                      
                      /* Force video containers to be visible */
                      .videocontainer,
                      .large-video-container,
                      .filmstrip,
                      .large-video,
                      #largeVideoContainer,
                      #dominantSpeaker,
                      .dominant-speaker {
                        display: block !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                        position: relative !important;
                        width: 100% !important;
                        height: 100% !important;
                        background: #000 !important;
                      }
                      
                      /* Force body to be full size */
                      body {
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        overflow: hidden !important;
                        background: #000 !important;
                      }
                      
                      /* Hide UI elements that might block video */
                      .welcome-page,
                      .prejoin-screen {
                        display: none !important;
                      }
                    `;

                    iframeDoc.head.appendChild(style);
                    console.log("CSS injected successfully");
                  }
                } catch (error) {
                  console.error("Failed to inject CSS into iframe:", error);
                }
              }
            }, 2000);
          });
          api.addListener("videoConferenceLeft", () => {
            console.log("Video conference left");
            setParticipants(0);
          });

          console.log("Jitsi initialization complete");
          setIsInMeeting(true);
        }
      } catch (err) {
        console.error("Jitsi initialization error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(
          `Failed to initialize video conference: ${errorMessage}. Please ensure you're using HTTPS and have granted camera/microphone permissions.`
        );

        // Reset initialization state to allow retry
        setIsInitialized(false);
      } finally {
        setLoading(false);
      }
    };

    // Use a small delay to ensure the DOM is fully mounted
    const timeoutId = setTimeout(() => {
      initializeJitsi();
    }, 50);

    return () => {
      clearTimeout(timeoutId);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (jitsiApi) {
        jitsiApi.dispose();
      }
    };
  }, [
    roomName,
    userName,
    isHost,
    jitsiApi,
    leaveMeeting,
    setError,
    setIsInMeeting,
    setJitsiApi,
    setLoading,
    userEmail,
    isInitialized,
    navigate,
    containerMounted,
    currentJitsiServer,
    setShowServerSelection,
  ]);

  const handleLeaveMeeting = () => {
    leaveMeeting();
    navigate("/");
  };

  const handleCopyMeetingUrl = async () => {
    const success = await copyToClipboard(meetingUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleControlsVisibility = () => {
    setShowControls((prev) => !prev);
  };

  const handleServerSelect = (server: string) => {
    console.log(`Switching to server: ${server}`);
    setCurrentJitsiServer(server);
    setShowServerSelection(false);
    setError(null);
    setIsInitialized(false); // This will trigger a re-initialization
    setConnectionStatus("connecting");
  };

  const handleRetryConnection = () => {
    console.log("Retrying connection...");
    setShowServerSelection(false);
    setError(null);
    setIsInitialized(false); // This will trigger a re-initialization
    setConnectionStatus("connecting");
  };

  const handleCloseServerSelection = () => {
    setShowServerSelection(false);
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-gray-900">
        {/* Debug info overlay */}
        <div className="absolute top-0 left-0 z-50 p-2 text-xs text-white bg-red-600 bg-opacity-75">
          Debug: Container=LOADING, Init={isInitialized ? "YES" : "NO"}, Room=
          {roomName || "NONE"}
        </div>

        {/* Jitsi Container - keep it mounted during loading */}
        <div
          id="jitsi-container"
          ref={setJitsiContainerRef}
          className="jitsi-container"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 1,
            background: "#000",
            minHeight: "100vh",
            minWidth: "100vw",
          }}
        ></div>

        {/* Loading overlay */}
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-gray-900">
          <Loading message="Joining meeting..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center text-white">
          <h1 className="mb-4 text-2xl font-bold">Unable to join meeting</h1>
          <p className="mb-6">{error}</p>
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-900">
      {/* Debug info overlay */}
      <div className="absolute top-0 left-0 z-50 p-2 text-xs text-white bg-red-600 bg-opacity-75">
        Debug: Container={containerMounted ? "YES" : "NO"}, Init=
        {isInitialized ? "YES" : "NO"}, Room={roomName || "NONE"}, Status=
        {connectionStatus}, Server={currentJitsiServer}
      </div>

      {/* Meeting Info Bar */}
      {showControls && (
        <div className="absolute top-0 left-0 right-0 z-10 p-4 text-white bg-black bg-opacity-50">
          <div className="flex items-center justify-between mx-auto max-w-7xl">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold">
                {roomName}
                {isHost && (
                  <span className="px-2 py-1 ml-2 text-xs bg-blue-600 rounded">
                    HOST
                  </span>
                )}
              </h1>
              <div className="flex items-center space-x-2 text-sm">
                <span className="flex items-center">
                  <div className="w-2 h-2 mr-2 bg-green-400 rounded-full"></div>
                  {participants} participant{participants !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyMeetingUrl}
                className="text-white border-white hover:bg-white hover:text-gray-900"
              >
                {copied ? "Copied!" : "Copy Link"}
              </Button>

              <Button variant="danger" size="sm" onClick={handleLeaveMeeting}>
                Leave Meeting
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Controls */}
      {showControls && (
        <div className="absolute z-10 transform -translate-x-1/2 bottom-4 left-1/2">
          <div className="flex items-center p-2 space-x-2 bg-black bg-opacity-75 rounded-lg">
            <Button
              variant={isAudioMuted ? "danger" : "secondary"}
              size="sm"
              onClick={toggleAudio}
              className="p-2"
              title={isAudioMuted ? "Unmute" : "Mute"}
            >
              {isAudioMuted ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              )}
            </Button>

            <Button
              variant={isVideoMuted ? "danger" : "secondary"}
              size="sm"
              onClick={toggleVideo}
              className="p-2"
              title={isVideoMuted ? "Turn on camera" : "Turn off camera"}
            >
              {isVideoMuted ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </Button>

            <Button
              variant={isScreenSharing ? "primary" : "secondary"}
              size="sm"
              onClick={toggleScreenSharing}
              className="p-2"
              title="Share screen"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </Button>

            <Button
              variant={isChatOpen ? "primary" : "secondary"}
              size="sm"
              onClick={toggleChat}
              className="p-2"
              title="Toggle chat"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </Button>
          </div>
        </div>
      )}

      {/* Hide/Show Controls Button */}
      <button
        onClick={toggleControlsVisibility}
        className="absolute z-20 p-2 text-white transition-opacity bg-black bg-opacity-50 rounded-full top-4 right-4 hover:bg-opacity-75"
        title={showControls ? "Hide controls" : "Show controls"}
      >
        {showControls ? (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        )}
      </button>

      {/* Jitsi Container */}
      <div
        id="jitsi-container"
        ref={setJitsiContainerRef}
        className="jitsi-container"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 1,
          background: "#000",
          minHeight: "100vh",
          minWidth: "100vw",
        }}
        onLoad={() => console.log("Jitsi container loaded")}
      ></div>

      {/* Server Selection Modal */}
      {showServerSelection && (
        <ServerSelector
          currentServer={currentJitsiServer}
          onServerSelect={handleServerSelect}
          onRetry={handleRetryConnection}
          onClose={handleCloseServerSelection}
        />
      )}

      {/* Fallback: Show direct Jitsi link if initialization fails */}
      {error && !showServerSelection && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-gray-900 bg-opacity-90">
          <div className="max-w-md p-8 text-center text-white bg-gray-800 rounded-lg">
            <h2 className="mb-4 text-xl font-bold">Unable to join meeting</h2>
            <p className="mb-4 text-gray-300">{error}</p>

            <div className="mb-6 text-sm text-gray-400">
              <p className="mb-2">You can try:</p>
              <ul className="text-left list-disc list-inside">
                <li>Using a different Jitsi server</li>
                <li>Joining directly through Jitsi Meet</li>
                <li>Asking the host to disable waiting rooms</li>
              </ul>
            </div>

            <div className="space-y-3 mb-4">
              <Button
                onClick={() => setShowServerSelection(true)}
                className="w-full"
                variant="primary"
              >
                Try Different Server
              </Button>
              
              <a
                href={meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-6 py-3 text-center text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Open in Jitsi Meet ({currentJitsiServer})
              </a>
            </div>
            
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="text-gray-300 border-gray-600"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
