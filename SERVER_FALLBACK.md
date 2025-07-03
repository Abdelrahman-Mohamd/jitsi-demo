# Jitsi Server Fallback System

## Overview

This application now includes a comprehensive fallback system for handling Jitsi connection issues, particularly the "membersOnly" error that occurs when joining rooms with waiting rooms enabled.

## Problem

The public Jitsi server (meet.jit.si) enforces lobby/waiting room policies for security reasons. When users try to join certain rooms, they encounter a "conference.connectionError.membersOnly" error, which results in a black screen and prevents joining the meeting.

## Solution

### 1. Multiple Server Support

The app now supports multiple Jitsi servers:
- **meet.jit.si** - Official Jitsi server (may have waiting rooms)
- **8x8.vc** - Alternative Jitsi server by 8x8
- **jitsi.riot.im** - Jitsi instance by Element (Matrix)

### 2. Automatic Error Detection

When the app detects a "membersOnly" error, it:
- Shows a user-friendly server selection modal
- Explains the waiting room issue
- Provides alternative servers to try

### 3. User Experience

Users can:
- Retry the connection with the same server
- Switch to alternative Jitsi servers
- Open the meeting directly in their browser
- Return to the home page

## Technical Implementation

### Components Added
- `ServerSelector.tsx` - Modal for server selection
- Updated `MeetingPage.tsx` - Server fallback logic
- Updated `appStore.ts` - Server state management
- Updated `meetingUtils.ts` - Multi-server support

### Key Features
- Dynamic server switching
- Error state management
- User-friendly error messages
- Direct browser fallback option

## Usage

1. When a connection fails with a "membersOnly" error, the server selection modal appears
2. Users can choose from available servers or retry the current one
3. The app reinitializes Jitsi with the selected server
4. If all servers fail, users can open the meeting directly in browser

## Limitations

- Public Jitsi servers may still enforce waiting rooms
- Some servers may have different feature sets
- Network connectivity affects server availability

## Recommendations

For production use, consider:
1. **Self-hosting Jitsi** - Full control over lobby settings
2. **Premium Jitsi services** - Reliable, professional service
3. **Alternative video services** - Agora, Twilio, etc.

## Testing

To test the fallback system:
1. Start the development server
2. Create a meeting and try to join
3. If you encounter connection issues, the server selector will appear
4. Try different servers to see which works best in your region

## Configuration

Server list is defined in `src/utils/meetingUtils.ts`:

```typescript
export const JITSI_SERVERS = [
  {
    domain: "meet.jit.si",
    name: "Jitsi Meet (Official)",
    description: "Official Jitsi server - may have waiting rooms enabled",
  },
  // ... more servers
];
```

You can add more servers by extending this array.
