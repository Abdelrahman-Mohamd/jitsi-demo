// Jitsi Meet API types
export interface DeviceInfo {
  deviceId: string;
  kind: string;
  label: string;
  groupId: string;
}

export interface ParticipantInfo {
  participantId: string;
  displayName?: string;
  formattedDisplayName?: string;
  email?: string;
  avatarURL?: string;
  role?: string;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: new (
      domain: string,
      options: JitsiConfig
    ) => JitsiAPI;
  }
}

export interface JitsiConfig {
  width: string | number;
  height: string | number;
  parentNode: HTMLElement;
  roomName: string;
  jwt?: string;
  configOverwrite?: {
    startWithAudioMuted?: boolean;
    startWithVideoMuted?: boolean;
    enableWelcomePage?: boolean;
    prejoinPageEnabled?: boolean;
    disableModeratorIndicator?: boolean;
    startScreenSharing?: boolean;
    enableEmailInStats?: boolean;
    // Network and connection configuration
    useStunTurn?: boolean;
    enableP2P?: boolean;
    p2p?: {
      enabled?: boolean;
      preferH264?: boolean;
      disableH264?: boolean;
      useStunTurn?: boolean;
    };
    iceServers?: Array<{
      urls: string | string[];
      username?: string;
      credential?: string;
    }>;
    enableLayerSuspension?: boolean;
    disableRtx?: boolean;
    enableTcc?: boolean;
    enableRemb?: boolean;
    openBridgeChannel?: boolean;
    // Lobby and security configuration
    enableLobby?: boolean;
    enableLobbyChat?: boolean;
    enableSecurityDialogPassword?: boolean;
    requireDisplayName?: boolean;
    enableUserRolesBasedOnToken?: boolean;
    enableAutomaticUrlDisplay?: boolean;
    disableLobby?: boolean;
    moderatedRoomServiceUrl?: string | undefined;
    enableModerationForAnonymousUsers?: boolean;
    enableInsecureRoomNameWarning?: boolean;
    enableClosePage?: boolean;
    autoKnockLobby?: boolean;
    hideConferenceSubject?: boolean;
    // Additional bypass options
    enableGuestDomain?: boolean;
    disableThirdPartyRequests?: boolean;
  };
  interfaceConfigOverwrite?: {
    TOOLBAR_BUTTONS?: string[];
    SETTINGS_SECTIONS?: string[];
    SHOW_JITSI_WATERMARK?: boolean;
    SHOW_WATERMARK_FOR_GUESTS?: boolean;
    SHOW_BRAND_WATERMARK?: boolean;
    BRAND_WATERMARK_LINK?: string;
    DEFAULT_BACKGROUND?: string;
    DISABLE_VIDEO_BACKGROUND?: boolean;
    INITIAL_TOOLBAR_TIMEOUT?: number;
    TOOLBAR_TIMEOUT?: number;
    DEFAULT_REMOTE_DISPLAY_NAME?: string;
    DEFAULT_LOCAL_DISPLAY_NAME?: string;
    SHOW_CHROME_EXTENSION_BANNER?: boolean;
    filmStripOnly?: boolean;
    HIDE_INVITE_MORE_HEADER?: boolean;
    MOBILE_APP_PROMO?: boolean;
    NATIVE_APP_NAME?: string;
    PROVIDER_NAME?: string;
    SHOW_DEEP_LINKING_IMAGE?: boolean;
  };
  onload?: () => void;
  invitees?: Array<{ id: string; avatar: string; name: string; email: string }>;
  devices?: {
    audioInput?: string;
    audioOutput?: string;
    videoInput?: string;
  };
  userInfo?: {
    displayName?: string;
    email?: string;
  };
}

export interface JitsiAPI {
  dispose: () => void;
  executeCommand: (command: string, ...args: unknown[]) => void;
  executeCommands: (commands: Record<string, unknown>) => void;
  getAvailableDevices: () => Promise<{
    audioInput: DeviceInfo[];
    audioOutput: DeviceInfo[];
    videoInput: DeviceInfo[];
  }>;
  getCurrentDevices: () => Promise<{
    audioInput?: DeviceInfo;
    audioOutput?: DeviceInfo;
    videoInput?: DeviceInfo;
  }>;
  isDeviceListAvailable: () => Promise<boolean>;
  isDeviceChangeAvailable: (deviceType: string) => Promise<boolean>;
  isMultipleAudioInputSupported: () => Promise<boolean>;
  setAudioInputDevice: (deviceId: string, deviceLabel?: string) => void;
  setAudioOutputDevice: (deviceId: string, deviceLabel?: string) => void;
  setVideoInputDevice: (deviceId: string, deviceLabel?: string) => void;
  getParticipantsInfo: () => ParticipantInfo[];
  getVideoQuality: () => number;
  isAudioMuted: () => Promise<boolean>;
  isVideoMuted: () => Promise<boolean>;
  isAudioAvailable: () => Promise<boolean>;
  isVideoAvailable: () => Promise<boolean>;
  invite: (
    invitees: Array<{ id: string; avatar: string; name: string; email: string }>
  ) => Promise<void>;
  addListener: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener: (
    event: string,
    listener: (...args: unknown[]) => void
  ) => void;
  removeAllListeners: (event?: string) => void;
}

export type UserRole = "host" | "guest";

export interface Meeting {
  id: string;
  name: string;
  host: string;
  participants: number;
  isActive: boolean;
  createdAt: Date;
}
