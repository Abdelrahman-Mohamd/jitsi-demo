import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../ui/Button";
import { Loading } from "../ui/Loading";
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
  } = useAppStore();

  const [participants, setParticipants] = useState(0);
  const [meetingUrl, setMeetingUrl] = useState("");
  const [showControls, setShowControls] = useState(true);
  const [copied, setCopied] = useState(false);

  const isHost = searchParams.get("host") === "true" || userRole === "host";

  useEffect(() => {
    if (!roomName) {
      navigate("/");
      return;
    }

    if (!userName.trim()) {
      navigate("/");
      return;
    }

    const url = getMeetingUrl(roomName);
    setMeetingUrl(url);

    initializeJitsi();

    return () => {
      if (jitsiApi) {
        jitsiApi.dispose();
      }
    };
  }, [roomName, userName, navigate]);

  const initializeJitsi = async () => {
    try {
      setLoading(true);
      setError(null);

      await loadJitsiScript();

      if (jitsiContainerRef.current && roomName) {
        const config: JitsiConfig = {
          width: "100%",
          height: "100%",
          parentNode: jitsiContainerRef.current,
          roomName: roomName,
          configOverwrite: {
            startWithAudioMuted: !isHost,
            startWithVideoMuted: false,
            enableWelcomePage: false,
            prejoinPageEnabled: false,
            disableModeratorIndicator: false,
            startScreenSharing: false,
            enableEmailInStats: false,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "closedcaptions",
              "desktop",
              "fullscreen",
              "fodeviceselection",
              "hangup",
              "profile",
              "chat",
              "recording",
              "livestreaming",
              "etherpad",
              "sharedvideo",
              "settings",
              "raisehand",
              "videoquality",
              "filmstrip",
              "invite",
              "feedback",
              "stats",
              "shortcuts",
              "tileview",
              "videobackgroundblur",
              "download",
              "help",
              "mute-everyone",
              "security",
            ],
            SETTINGS_SECTIONS: [
              "devices",
              "language",
              "moderator",
              "profile",
              "calendar",
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_CHROME_EXTENSION_BANNER: false,
            DEFAULT_REMOTE_DISPLAY_NAME: "Participant",
            DEFAULT_LOCAL_DISPLAY_NAME: userName || "You",
          },
          userInfo: {
            displayName: userName,
            email: userEmail || undefined,
          },
        };

        const api = new window.JitsiMeetExternalAPI("meet.jit.si", config);
        setJitsiApi(api);

        // Event listeners
        api.addListener("readyToClose", handleReadyToClose);
        api.addListener("participantJoined", handleParticipantJoined);
        api.addListener("participantLeft", handleParticipantLeft);
        api.addListener("videoConferenceJoined", handleVideoConferenceJoined);
        api.addListener("videoConferenceLeft", handleVideoConferenceLeft);

        setIsInMeeting(true);
      }
    } catch (err) {
      setError("Failed to initialize video conference. Please try again.");
      console.error("Jitsi initialization error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReadyToClose = () => {
    leaveMeeting();
    navigate("/");
  };

  const handleParticipantJoined = () => {
    setParticipants((prev) => prev + 1);
  };

  const handleParticipantLeft = () => {
    setParticipants((prev) => Math.max(0, prev - 1));
  };

  const handleVideoConferenceJoined = () => {
    setParticipants(1); // Include self
  };

  const handleVideoConferenceLeft = () => {
    setParticipants(0);
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loading message="Joining meeting..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Unable to join meeting</h1>
          <p className="mb-6">{error}</p>
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Meeting Info Bar */}
      {showControls && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 text-white p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold">
                {roomName}
                {isHost && (
                  <span className="ml-2 px-2 py-1 bg-blue-600 text-xs rounded">
                    HOST
                  </span>
                )}
              </h1>
              <div className="flex items-center space-x-2 text-sm">
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
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
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex items-center space-x-2 bg-black bg-opacity-75 rounded-lg p-2">
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
        className="absolute top-4 right-4 z-20 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
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
        ref={jitsiContainerRef}
        className="w-full h-screen"
        style={{ minHeight: "100vh" }}
      />
    </div>
  );
};
