"use client"

import { useState, useEffect, useCallback, useRef } from "react";
import useWebSocket from "react-use-websocket";
import api from "@/utils/api";

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deviceId, setDeviceId] = useState("");

  // Get or create device ID
  useEffect(() => {
    const storedDeviceId = localStorage.getItem("chat_device_id");
    if (storedDeviceId) {
      setDeviceId(storedDeviceId);
    } else {
      const newDeviceId = `user_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("chat_device_id", newDeviceId);
      setDeviceId(newDeviceId);
    }
  }, []);

  // Fetch existing messages
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/messages/");
      setMessages(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // WebSocket connection
  const { sendJsonMessage } = useWebSocket(
    process.env.NODE_ENV === "production"
      ? `wss://${window.location.host}/ws/messages/community/`
      : `ws://${window.location.host}/ws/messages/community/`,
    {
      onMessage: (event) => {
        const data = JSON.parse(event.data);
        // Create a message object similar to what API would return
        const newMessage = {
          id: Date.now(), // Temporary ID
          device_id: data.device_id,
          message: data.message,
          created_at: new Date().toISOString(),
          is_deleted: false,
        };

        setMessages((prev) => [...prev, newMessage]);
      },
      onOpen: () => {
        console.log("WebSocket Connected");
      },
      onError: (event) => {
        console.error("WebSocket error:", event);
        setError("Connection error. Trying to reconnect...");
      },
      shouldReconnect: () => true,
      reconnectInterval: 3000,
      reconnectAttempts: 10,
    }
  );

const sendMessage = useCallback(
  async (messageText) => {
    if (deviceId && messageText) {
      try {
        // Create message object
        const newMessage = {
          id: Date.now(), // Temporary ID
          device_id: deviceId,
          message: messageText,
          created_at: new Date().toISOString(),
          is_deleted: false,
        };

        // Add message to UI immediately (optimistic update)
        setMessages((prev) => [...prev, newMessage]);

        // Send through WebSocket for real-time updates
        sendJsonMessage({
          device_id: deviceId,
          message: messageText,
        });

        // Also post to backend API
        await api.post("/api/messages/", {
          device_id: deviceId,
          message: messageText,
        });
      } catch (err) {
        console.error("Error sending message:", err);
        setError("Failed to send message");
      }
    }
  },
  [deviceId, sendJsonMessage]
);

  return {
    messages,
    loading,
    error,
    deviceId,
    sendMessage,
    refreshMessages: fetchMessages,
  };
}
