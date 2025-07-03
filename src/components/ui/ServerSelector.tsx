import React from "react";
import { Button } from "./Button";
import { JITSI_SERVERS } from "../../utils/meetingUtils";

interface ServerSelectorProps {
  currentServer: string;
  onServerSelect: (server: string) => void;
  onClose: () => void;
  onRetry: () => void;
}

export const ServerSelector: React.FC<ServerSelectorProps> = ({
  currentServer,
  onServerSelect,
  onClose,
  onRetry,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">
          Connection Failed - Try Alternative Server
        </h3>
        
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            The current server may have waiting rooms enabled. Try an alternative 
            server or ask the meeting host to disable the waiting room feature.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {JITSI_SERVERS.map((server) => (
            <div
              key={server.domain}
              className={`p-3 border rounded cursor-pointer transition-colors ${
                currentServer === server.domain
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onClick={() => onServerSelect(server.domain)}
            >
              <div className="font-medium">{server.name}</div>
              <div className="text-sm text-gray-600">{server.description}</div>
              <div className="text-xs text-gray-500 mt-1">{server.domain}</div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Button
            onClick={onRetry}
            className="w-full"
            variant="primary"
          >
            Retry Connection
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => onServerSelect("8x8.vc")}
              variant="secondary"
              className="text-sm"
            >
              Try 8x8.vc
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
          <p className="font-medium mb-1">Having trouble?</p>
          <p>
            Public Jitsi servers may have waiting rooms enabled for security. 
            For reliable meetings without waiting rooms, consider using a 
            self-hosted Jitsi instance.
          </p>
        </div>
      </div>
    </div>
  );
};
