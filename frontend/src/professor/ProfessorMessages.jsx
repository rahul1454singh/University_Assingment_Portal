import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import api from "../services/api";
import ProfessorLayout from "./ProfessorLayout";
import MessageContactDropdown from "../components/MessageContactDropdown";
import DepartmentCell from "../components/DepartmentCell";
import { Send, UserCheck, MessageSquare, Check, CheckCheck, User, Search } from "lucide-react";
import "../css/Messages.css";

const ProfessorMessages = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [openPopoverId, setOpenPopoverId] = useState(null);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize Socket.IO connection and current user
  useEffect(() => {
    fetchCurrentUser();

    const socket = io("https://university-assingment-portal-irjm.vercel.app", {
      withCredentials: true,
      transports: ["websocket", "polling"]
    });

    socketRef.current = socket;

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (currentUser && socketRef.current) {
      socketRef.current.emit("register_user", currentUser.id);
    }
  }, [currentUser]);

  // Handle Socket Events
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleReceiveMessage = (newMsg) => {
      if (selectedContact && (newMsg.sender === selectedContact._id || newMsg.sender._id === selectedContact._id)) {
        setMessages((prev) => [...prev, newMsg]);
        markAsRead(selectedContact._id);
        if (socketRef.current && currentUser) {
          socketRef.current.emit("mark_read", {
            senderId: selectedContact._id,
            readerId: currentUser.id
          });
        }
      } else {
        setContacts((prev) =>
          prev.map((c) =>
            c._id === newMsg.sender ? { ...c, unreadCount: (c.unreadCount || 0) + 1 } : c
          )
        );
      }
    };

    const handleUserStatusChanged = ({ userId, isOnline, lastSeen }) => {
      setContacts((prev) =>
        prev.map((c) =>
          c._id === userId ? { ...c, isOnline, lastSeen: lastSeen || c.lastSeen } : c
        )
      );
      if (selectedContact && selectedContact._id === userId) {
        setSelectedContact((prev) => ({ ...prev, isOnline, lastSeen: lastSeen || prev.lastSeen }));
      }
    };

    const handleUserTyping = ({ senderId, isTyping: typingState }) => {
      if (selectedContact && selectedContact._id === senderId) {
        setIsTyping(typingState);
      }
    };

    const handleMessagesSeen = ({ readerId }) => {
      if (selectedContact && selectedContact._id === readerId) {
        setMessages((prev) =>
          prev.map((m) => ({ ...m, status: "seen", read: true }))
        );
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("user_status_changed", handleUserStatusChanged);
    socket.on("user_typing", handleUserTyping);
    socket.on("messages_seen", handleMessagesSeen);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("user_status_changed", handleUserStatusChanged);
      socket.off("user_typing", handleUserTyping);
      socket.off("messages_seen", handleMessagesSeen);
    };
  }, [selectedContact, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/api/auth/me");
      if (res.data && res.data.user) {
        setCurrentUser(res.data.user);
        loadContacts();
      }
    } catch (err) {
      console.error("Fetch current user error:", err);
    }
  };

  const loadContacts = async () => {
    try {
      const res = await api.get("/api/messages/contacts");
      if (res.data && res.data.contacts) {
        setContacts(res.data.contacts);
      }
    } catch (err) {
      console.error("Load contacts error:", err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleDropdownChange = (contactId) => {
    if (!contactId) {
      setSelectedContact(null);
      setMessages([]);
      return;
    }
    const found = contacts.find((c) => c._id === contactId);
    if (found) {
      selectContact(found);
    }
  };

  const selectContact = (contact) => {
    setSelectedContact(contact);
    setIsTyping(false);
    loadHistory(contact._id);

    setContacts((prev) =>
      prev.map((c) => (c._id === contact._id ? { ...c, unreadCount: 0 } : c))
    );
  };

  const loadHistory = async (contactId) => {
    setLoadingMessages(true);
    try {
      const res = await api.get(`/api/messages/history/${contactId}`);
      if (res.data && res.data.messages) {
        setMessages(res.data.messages);
        if (socketRef.current && currentUser) {
          socketRef.current.emit("mark_read", {
            senderId: contactId,
            readerId: currentUser.id
          });
        }
      }
    } catch (err) {
      console.error("Load chat history error:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const markAsRead = async (contactId) => {
    try {
      await api.put(`/api/messages/mark-read/${contactId}`);
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);

    if (!selectedContact || !socketRef.current || !currentUser) return;

    socketRef.current.emit("typing_start", {
      senderId: currentUser.id,
      receiverId: selectedContact._id
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("typing_stop", {
        senderId: currentUser.id,
        receiverId: selectedContact._id
      });
    }, 1500);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage || !inputMessage.trim() || !selectedContact || !currentUser) return;

    const msgText = inputMessage.trim();
    setInputMessage("");

    if (socketRef.current) {
      socketRef.current.emit("typing_stop", {
        senderId: currentUser.id,
        receiverId: selectedContact._id
      });
    }

    try {
      const res = await api.post("/api/messages/send", {
        receiverId: selectedContact._id,
        message: msgText
      });

      if (res.data && res.data.message) {
        const createdMsg = res.data.message;
        setMessages((prev) => [...prev, createdMsg]);

        if (socketRef.current) {
          socketRef.current.emit("send_message", {
            senderId: currentUser.id,
            receiverId: selectedContact._id,
            message: msgText,
            messageId: createdMsg._id
          });
        }
      }
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return "Today";
    const d = new Date(dateStr);
    const now = new Date();

    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    if (isToday) return "Today";

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return "Yesterday";

    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatLastSeen = (dateStr) => {
    if (!dateStr) return "Offline";
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return "Last seen just now";
    if (diffMins < 60) return `Last seen ${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `Last seen ${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `Last seen ${d.toLocaleDateString()}`;
  };

  return (
    <ProfessorLayout title="Student Messages" userName={currentUser?.name}>
      <div className="messages-page animate-fade-in">
        {/* Top Dropdown Bar */}
        <div className="messages-select-bar card" style={{ padding: "16px 20px", marginBottom: "16px" }}>
          <label style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <UserCheck size={18} color="#2563eb" />
            <span>Select Student to Chat:</span>
          </label>
          <MessageContactDropdown
            placeholder="Select a student to start chatting..."
            options={contacts}
            selectedId={selectedContact?._id || ""}
            onSelect={handleDropdownChange}
            prefix=""
          />
        </div>

        {/* Chat Card Box */}
        <div className="messages-container card">
          {/* Left Panel: Contact Selector List */}
          <div className="contacts-sidebar">
            <div className="contacts-header">
              <h3 className="contacts-title">Assigned Students</h3>
            </div>

            <div className="contacts-list">
              {loadingContacts ? (
                <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>Loading students...</p>
              ) : contacts.length === 0 ? (
                <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px", fontSize: "13px" }}>
                  No students found in your department.
                </p>
              ) : (
                contacts.map((c) => {
                  const isSel = selectedContact?._id === c._id;
                  const firstLetter = c.name ? c.name.charAt(0).toUpperCase() : "S";
                  return (
                    <div
                      key={c._id}
                      className={`contact-card ${isSel ? "active" : ""}`}
                      onClick={() => selectContact(c)}
                    >
                      <div className="avatar-wrapper">
                        {c.profileImage ? (
                          <img src={c.profileImage} alt={c.name} className="contact-avatar" />
                        ) : (
                          <div className="contact-avatar">{firstLetter}</div>
                        )}
                        {c.isOnline && <span className="online-dot" title="Online"></span>}
                      </div>

                      <div className="contact-info">
                        <p className="contact-name">{c.name}</p>
                        <div className="contact-dept" onClick={(e) => e.stopPropagation()}>
                          <DepartmentCell 
                            departments={c.departments?.length > 0 ? c.departments : (c.departmentName ? [c.departmentName] : [])}
                            userId={c._id}
                            openPopoverId={openPopoverId}
                            setOpenPopoverId={setOpenPopoverId}
                          />
                        </div>
                      </div>

                      {c.unreadCount > 0 && (
                        <span className="unread-badge">{c.unreadCount}</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Chat Area */}
          <div className="chat-panel">
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="chat-header">
                  <div className="chat-header-user">
                    <div className="avatar-wrapper">
                      {selectedContact.profileImage ? (
                        <img src={selectedContact.profileImage} alt={selectedContact.name} className="contact-avatar" />
                      ) : (
                        <div className="contact-avatar">
                          {selectedContact.name ? selectedContact.name.charAt(0).toUpperCase() : "S"}
                        </div>
                      )}
                      {selectedContact.isOnline && <span className="online-dot"></span>}
                    </div>

                    <div>
                      <h3 className="header-name">{selectedContact.name}</h3>
                      <p className={`header-status ${selectedContact.isOnline ? "online" : ""}`}>
                        {selectedContact.isOnline ? "● Online" : formatLastSeen(selectedContact.lastSeen)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages History */}
                <div className="messages-history">
                  {loadingMessages ? (
                    <p style={{ textAlign: "center", color: "var(--text-muted)", margin: "auto" }}>Loading conversation history...</p>
                  ) : messages.length === 0 ? (
                    <div className="empty-chat-state">
                      <MessageSquare size={36} className="empty-chat-icon" />
                      <p>Start a direct conversation with {selectedContact.name}.</p>
                    </div>
                  ) : (
                    (() => {
                      let lastDateLabel = "";
                      return messages.map((m, index) => {
                        const isMe = m.sender === currentUser?.id || m.sender._id === currentUser?.id;
                        const msgTime = new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                        const dateLabel = formatDateLabel(m.createdAt);
                        const showDateSeparator = dateLabel !== lastDateLabel;
                        if (showDateSeparator) {
                          lastDateLabel = dateLabel;
                        }

                        return (
                          <React.Fragment key={m._id || index}>
                            {showDateSeparator && (
                              <div className="chat-date-separator">
                                <span>{dateLabel}</span>
                              </div>
                            )}
                            <div className={`message-bubble-wrapper ${isMe ? "sent" : "received"}`}>
                              <div className="message-bubble">{m.message}</div>
                              <div className="message-meta">
                                <span>{msgTime}</span>
                                {isMe && (
                                  <span className={`status-indicator ${m.status === "seen" || m.read ? "seen" : "sent"}`}>
                                    {m.status === "seen" || m.read ? <CheckCheck size={14} /> : <Check size={14} />}
                                  </span>
                                )}
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      });
                    })()
                  )}

                  {isTyping && (
                    <div className="typing-indicator-bar">
                      {selectedContact.name} is typing...
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Footer */}
                <form onSubmit={handleSendMessage} className="chat-input-footer">
                  <input
                    type="text"
                    className="chat-input-field form-input"
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={handleInputChange}
                  />
                  <button type="submit" className="btn btn-primary" disabled={!inputMessage.trim()}>
                    <Send size={16} />
                    <span>Send</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="empty-chat-state">
                <MessageSquare size={48} className="empty-chat-icon" />
                <h3>Select a student to start chatting</h3>
                <p>Choose a contact from the dropdown menu above or the list on the left to view message history and send messages.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProfessorLayout>
  );
};

export default ProfessorMessages;
