# Video Conference App

A Zoom-like video conferencing web application built with React, TypeScript, and the Jitsi Meet External API.

## Features

### Core Features

- **Create Meeting**: Generate a new meeting room with a unique room name
- **Join Meeting**: Enter an existing room name to join a meeting
- **Host/Guest Roles**: Different UI options for hosts and guests
- **HD Video & Audio**: High-quality video calls with crystal clear audio
- **Screen Sharing**: Share your screen with other participants
- **Chat**: Built-in chat functionality
- **Responsive Design**: Works on desktop and mobile devices

### Technical Features

- **React 19** with TypeScript for type safety
- **React Router** for client-side routing
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Jitsi Meet External API** for video conferencing
- **Error Boundaries** for better error handling
- **Loading States** for smooth user experience

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Creating a Meeting

1. Go to the home page
2. Enter your name (email is optional)
3. Click "Create New Meeting"
4. You'll be redirected to a new meeting room as the host
5. Share the meeting URL with participants

### Joining a Meeting

1. Go to the home page
2. Enter your name (email is optional)
3. Enter the room name or meeting ID
4. Click "Join Meeting"
5. You'll join as a guest participant

### Meeting Controls

- **Mute/Unmute**: Toggle your microphone
- **Camera On/Off**: Toggle your camera
- **Screen Share**: Share your screen with participants
- **Chat**: Open/close the chat panel
- **Leave Meeting**: Exit the meeting and return to home

## Project Structure

```
src/
├── components/
│   ├── pages/
│   │   ├── HomePage.tsx        # Home page with create/join options
│   │   └── MeetingPage.tsx     # Meeting room with Jitsi integration
│   ├── ui/
│   │   ├── Button.tsx          # Reusable button component
│   │   ├── Input.tsx           # Reusable input component
│   │   └── Loading.tsx         # Loading spinner components
│   └── ErrorBoundary.tsx       # Error boundary for error handling
├── store/
│   └── appStore.ts             # Zustand store for state management
├── types/
│   └── jitsi.ts                # TypeScript types for Jitsi API
├── utils/
│   └── meetingUtils.ts         # Utility functions for meetings
├── App.tsx                     # Main app component with routing
├── main.tsx                    # App entry point
└── index.css                   # Global styles with Tailwind
```

## Technologies Used

- **React 19** - Modern React with hooks
- **TypeScript** - Type safety and better development experience
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first CSS framework
- **Jitsi Meet External API** - Video conferencing platform

## Browser Support

- Chrome 70+
- Firefox 70+
- Safari 12+
- Edge 79+

Note: WebRTC features require HTTPS in production.

## License

This project is licensed under the MIT License.
