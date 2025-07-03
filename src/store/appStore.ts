import { create } from "zustand";
import type { UserRole, Meeting, JitsiAPI } from "../types/jitsi";

interface AppState {
  // User state
  userRole: UserRole;
  userName: string;
  userEmail: string;

  // Meeting state
  currentMeeting: Meeting | null;
  isInMeeting: boolean;
  jitsiApi: JitsiAPI | null;

  // UI state
  isLoading: boolean;
  error: string | null;
  isChatOpen: boolean;
  isScreenSharing: boolean;
  isAudioMuted: boolean;
  isVideoMuted: boolean;

  // Actions
  setUserRole: (role: UserRole) => void;
  setUserInfo: (name: string, email: string) => void;
  setCurrentMeeting: (meeting: Meeting | null) => void;
  setJitsiApi: (api: JitsiAPI | null) => void;
  setIsInMeeting: (inMeeting: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleChat: () => void;
  toggleScreenSharing: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  leaveMeeting: () => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  userRole: "guest",
  userName: "",
  userEmail: "",
  currentMeeting: null,
  isInMeeting: false,
  jitsiApi: null,
  isLoading: false,
  error: null,
  isChatOpen: false,
  isScreenSharing: false,
  isAudioMuted: false,
  isVideoMuted: false,

  // Actions
  setUserRole: (role) => set({ userRole: role }),

  setUserInfo: (name, email) => set({ userName: name, userEmail: email }),

  setCurrentMeeting: (meeting) => set({ currentMeeting: meeting }),

  setJitsiApi: (api) => set({ jitsiApi: api }),

  setIsInMeeting: (inMeeting) => set({ isInMeeting: inMeeting }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  toggleChat: () => {
    const { jitsiApi } = get();
    if (jitsiApi) {
      jitsiApi.executeCommand("toggleChat");
    }
    set((state) => ({ isChatOpen: !state.isChatOpen }));
  },

  toggleScreenSharing: () => {
    const { jitsiApi } = get();
    if (jitsiApi) {
      jitsiApi.executeCommand("toggleShareScreen");
    }
    set((state) => ({ isScreenSharing: !state.isScreenSharing }));
  },

  toggleAudio: () => {
    const { jitsiApi } = get();
    if (jitsiApi) {
      jitsiApi.executeCommand("toggleAudio");
    }
    set((state) => ({ isAudioMuted: !state.isAudioMuted }));
  },

  toggleVideo: () => {
    const { jitsiApi } = get();
    if (jitsiApi) {
      jitsiApi.executeCommand("toggleVideo");
    }
    set((state) => ({ isVideoMuted: !state.isVideoMuted }));
  },

  leaveMeeting: () => {
    const { jitsiApi } = get();
    if (jitsiApi) {
      jitsiApi.dispose();
    }
    set({
      jitsiApi: null,
      isInMeeting: false,
      currentMeeting: null,
      isChatOpen: false,
      isScreenSharing: false,
      isAudioMuted: false,
      isVideoMuted: false,
    });
  },

  reset: () =>
    set({
      userRole: "guest",
      userName: "",
      userEmail: "",
      currentMeeting: null,
      isInMeeting: false,
      jitsiApi: null,
      isLoading: false,
      error: null,
      isChatOpen: false,
      isScreenSharing: false,
      isAudioMuted: false,
      isVideoMuted: false,
    }),
}));
