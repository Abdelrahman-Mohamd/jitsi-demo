import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useAppStore } from "../../store/appStore";
import {
  generateRoomName,
  validateRoomName,
  formatRoomName,
} from "../../utils/meetingUtils";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { setUserRole, setUserInfo } = useAppStore();

  const [roomName, setRoomName] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [roomNameError, setRoomNameError] = useState("");
  const [userNameError, setUserNameError] = useState("");

  const handleCreateMeeting = () => {
    if (!validateInputs()) return;

    setUserRole("host");
    setUserInfo(userName, userEmail);

    const generatedRoom = generateRoomName();
    navigate(`/meeting/${generatedRoom}?host=true`);
  };

  const handleJoinMeeting = () => {
    if (!validateInputs()) return;

    if (!roomName.trim()) {
      setRoomNameError("Please enter a room name");
      return;
    }

    if (!validateRoomName(roomName)) {
      setRoomNameError("Room name must be 3-50 characters long");
      return;
    }

    setUserRole("guest");
    setUserInfo(userName, userEmail);

    const formattedRoom = formatRoomName(roomName);
    navigate(`/meeting/${formattedRoom}`);
  };

  const validateInputs = (): boolean => {
    let isValid = true;

    if (!userName.trim()) {
      setUserNameError("Please enter your name");
      isValid = false;
    } else {
      setUserNameError("");
    }

    return isValid;
  };

  const handleGenerateRoomName = () => {
    const generated = generateRoomName();
    setRoomName(generated);
    setRoomNameError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Video Conference
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with anyone, anywhere. Create or join secure video meetings
            with ease.
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-6">
            {/* User Info Section */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                Join a Meeting
              </h2>

              <div className="space-y-4">
                <Input
                  label="Your Name"
                  type="text"
                  placeholder="Enter your full name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  error={userNameError}
                  required
                />

                <Input
                  label="Email (Optional)"
                  type="email"
                  placeholder="your.email@example.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  helperText="Your email won't be shared with other participants"
                />
              </div>
            </div>

            {/* Meeting Actions */}
            <div className="border-t pt-6">
              <div className="space-y-4">
                {/* Create Meeting */}
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleCreateMeeting}
                  disabled={!userName.trim()}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Create New Meeting
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>

                {/* Join Meeting */}
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter room name or ID"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      error={roomNameError}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleGenerateRoomName}
                      className="shrink-0"
                      title="Generate random room name"
                    >
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
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </Button>
                  </div>

                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    onClick={handleJoinMeeting}
                    disabled={!userName.trim() || !roomName.trim()}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Join Meeting
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
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
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                HD Video & Audio
              </h3>
              <p className="text-gray-600">
                Crystal clear video calls with high-quality audio
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
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
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chat & Share
              </h3>
              <p className="text-gray-600">
                Built-in chat and screen sharing capabilities
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Secure & Private
              </h3>
              <p className="text-gray-600">
                End-to-end encrypted meetings for your privacy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
