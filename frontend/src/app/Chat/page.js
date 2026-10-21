"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
  Bot,
  ChevronDown,
  Copy,
  Home,
  Menu,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Trash2,
  User,
  WandSparkles,
  X,
} from "lucide-react";

const API = "http://localhost:5001/api";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Hydration-safe default
  const [provider, setProvider] = useState("gemini");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [providerOpen, setProviderOpen] = useState(false);

  const [previousChats, setPreviousChats] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [copiedIndex, setCopiedIndex] = useState(null);

  const textareaRef = useRef(null);
  const bottomRef = useRef(null);
  const contextSent = useRef(false);

  const providerName =
    provider === "openai" ? "ChatGPT" : "Gemini";

  // --------------------------------------------------
  // LOAD SAVED PROVIDER AFTER MOUNT
  // --------------------------------------------------

  useEffect(() => {
    const saved = localStorage.getItem("aiProvider");

    if (saved === "chatgpt") {
      setProvider("openai");
    } else if (
      saved === "openai" ||
      saved === "gemini"
    ) {
      setProvider(saved);
    }
  }, []);

  // --------------------------------------------------
  // SAVE PROVIDER
  // --------------------------------------------------

  useEffect(() => {
    localStorage.setItem(
      "aiProvider",
      provider
    );
  }, [provider]);

  // --------------------------------------------------
  // AUTO SCROLL
  // --------------------------------------------------

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // --------------------------------------------------
  // GET USER
  // --------------------------------------------------

  const getUserId = () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      return user.id || null;
    } catch {
      return null;
    }
  };

  // --------------------------------------------------
  // LOAD CHAT HISTORY
  // --------------------------------------------------

  const loadPreviousChats = async () => {
    const userId = getUserId();
    const token =
      localStorage.getItem("token") || "";

    if (!userId || !token) {
      setHistoryLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API}/chat/history/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setPreviousChats(
          data.history || []
        );
      }
    } catch (error) {
      console.error(
        "History error:",
        error
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadPreviousChats();
  }, []);

  // --------------------------------------------------
  // SEND MESSAGE
  // --------------------------------------------------

  const sendMessage = async (
    customMessage = null
  ) => {
    const text = (
      customMessage ?? message
    ).trim();

    if (!text || loading) {
      return;
    }

    const userMessage = {
      role: "user",
      content: text,
    };

    const newMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(newMessages);
    setMessage("");
    setLoading(true);
    setProviderOpen(false);

    try {
      const token =
        localStorage.getItem("token") || "";

      const response = await apiFetch(
        "/api/chat",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${
                localStorage.getItem(
                  "token"
                ) || ""
              }`,
          },

          body: JSON.stringify({
            message: text,
            provider,
            history: messages,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Failed to generate response"
        );
      }

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: data.message || "",
          provider: data.provider || "Ollama",
          model: data.model || "",
        },
      ]);

      loadPreviousChats();
    } catch (error) {
      console.error(
        "Chat error:",
        error
      );

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          error: true,
          content:
            "Unable to connect to the AI service. Please make sure Ollama and Flask are running.",
        },
      ]);
    } finally {
      setLoading(false);

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  // --------------------------------------------------
  // URL CONTEXT
  // --------------------------------------------------

  useEffect(() => {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    const context =
      new URLSearchParams(
        window.location.search
      ).get("context");

    if (
      !context ||
      contextSent.current
    ) {
      return;
    }

    contextSent.current = true;

    sendMessage(context);
  }, []);

  // --------------------------------------------------
  // ENTER KEY
  // --------------------------------------------------

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  };

  // --------------------------------------------------
  // NEW CHAT
  // --------------------------------------------------

  const newChat = () => {
    setMessages([]);
    setMessage("");

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  // --------------------------------------------------
  // OPEN PREVIOUS CHAT
  // --------------------------------------------------

  const openChat = (chat) => {
    setMessages([
      {
        role: "user",
        content:
          chat.userMessage || "",
      },
      {
        role: "assistant",
        content:
          chat.aiResponse || "",
        provider:
          chat.provider || "Ollama",
      },
    ]);

    setSidebarOpen(false);
  };

  // --------------------------------------------------
  // DELETE CHAT
  // --------------------------------------------------

  const deleteChat = async (
    event,
    id
  ) => {
    event.stopPropagation();

    const token =
      localStorage.getItem("token") || "";

    try {
      const response = await fetch(
        `${API}/chat/history/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to delete chat"
        );
      }

      setPreviousChats(
        (items) =>
          items.filter(
            (item) => item.id !== id
          )
      );
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );
    }
  };

  // --------------------------------------------------
  // COPY RESPONSE
  // --------------------------------------------------

  const copyResponse = async (
    text,
    index
  ) => {
    try {
      await navigator.clipboard.writeText(
        text
      );

      setCopiedIndex(index);

      setTimeout(() => {
        setCopiedIndex(null);
      }, 1500);
    } catch (error) {
      console.error(
        "Copy error:",
        error
      );
    }
  };

  const startSuggestion = (text) => {
  setMessage(text);

  setTimeout(() => {
    textareaRef.current?.focus();
  }, 50);
};
  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#171717]">

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-40 bg-black/25 lg:hidden"
        />
      )}

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-[270px]
          flex-col
          border-r border-gray-200
          bg-white
          shadow-[8px_0_30px_rgba(0,0,0,0.03)]
          transition-transform duration-300
          lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* BRAND */}

        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbc531] text-black shadow-sm">
              <Sparkles size={20} />
            </div>

            <div>
              <p className="text-base font-extrabold">
                StudyMate
              </p>

              <p className="text-[11px] text-gray-400">
                AI Study Assistant
              </p>
            </div>
          </Link>

          <button
            onClick={() =>
              setSidebarOpen(false)
            }
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 lg:hidden"
          >
            <X size={18} />
          </button>

        </div>

        {/* NEW CHAT */}

        <div className="p-4">

          <button
            onClick={newChat}
            className="
              flex w-full
              items-center justify-center
              gap-2
              rounded-xl
              border border-gray-200
              bg-white
              px-4 py-3
              text-sm font-semibold
              shadow-sm
              transition
              hover:border-[#fbc531]
              hover:bg-[#fffdf5]
            "
          >
            <Plus size={17} />
            New Chat
          </button>

        </div>

        {/* PREVIOUS CHATS */}

        <div className="px-4">

          <div className="mb-2 flex items-center justify-between px-2">

            <p className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.15em]
              text-gray-400
            ">
              Recent chats
            </p>

            {previousChats.length > 0 && (
              <span className="
                rounded-full
                bg-gray-100
                px-2
                py-0.5
                text-[10px]
                font-bold
                text-gray-400
              ">
                {previousChats.length}
              </span>
            )}

          </div>

          <div className="max-h-60 space-y-1 overflow-y-auto">

            {historyLoading ? (

              <p className="px-2 py-3 text-xs text-gray-400">
                Loading chats...
              </p>

            ) : previousChats.length === 0 ? (

              <div className="
                rounded-xl
                border border-dashed
                border-gray-200
                bg-gray-50
                p-3
              ">

                <MessageSquare
                  size={16}
                  className="mb-2 text-gray-400"
                />

                <p className="
                  text-xs
                  leading-5
                  text-gray-400
                ">
                  Your previous study sessions
                  will appear here.
                </p>

              </div>

            ) : (

              previousChats.map(
                (chat) => (

                  <div
                    key={chat.id}
                    className="
                      group flex
                      items-center
                      rounded-xl
                      hover:bg-gray-50
                    "
                  >

                    <button
                      onClick={() =>
                        openChat(chat)
                      }
                      className="
                        min-w-0
                        flex-1
                        px-3 py-2.5
                        text-left
                      "
                    >

                      <span className="
                        block
                        truncate
                        text-xs
                        font-semibold
                        text-gray-700
                      ">
                        {chat.userMessage ||
                          "Study session"}
                      </span>

                      <span className="
                        mt-1 block
                        text-[10px]
                        text-gray-400
                      ">
                        {chat.createdAt
                          ? new Date(
                              chat.createdAt
                            ).toLocaleDateString()
                          : "Recent"}
                      </span>

                    </button>

                    <button
                      onClick={(event) =>
                        deleteChat(
                          event,
                          chat.id
                        )
                      }
                      className="
                        mr-1
                        rounded-lg
                        p-2
                        text-gray-300
                        opacity-0
                        transition
                        group-hover:opacity-100
                        hover:bg-red-50
                        hover:text-red-500
                      "
                      title="Delete chat"
                    >
                      <Trash2 size={14} />
                    </button>

                  </div>

                )
              )

            )}

          </div>
        </div>

        {/* WORKSPACE */}

        <div className="px-4 pt-7">

          <p className="
            mb-2 px-2
            text-[10px]
            font-bold
            uppercase
            tracking-[0.15em]
            text-gray-400
          ">
            Workspace
          </p>

          <Link
            href="/"
            className="
              mb-1
              flex items-center gap-3
              rounded-xl px-3 py-2.5
              text-sm
              text-gray-500
              transition
              hover:bg-gray-50
              hover:text-gray-900
            "
          >
            <Home size={17} />
            Home
          </Link>

          <Link
            href="/prompt-generator"
            className="
              mb-1
              flex items-center gap-3
              rounded-xl px-3 py-2.5
              text-sm
              text-gray-500
              transition
              hover:bg-gray-50
              hover:text-gray-900
            "
          >
            <WandSparkles size={17} />
            Prompt Generator
          </Link>

          <Link
            href="/Chat"
            className="
              flex items-center gap-3
              rounded-xl
              bg-[#fff7d6]
              px-3 py-2.5
              text-sm
              font-bold
              text-gray-900
            "
          >
            <MessageSquare size={17} />
            AI Chat
          </Link>

        </div>

        {/* INFO */}

        <div className="mt-auto p-4">

          <div className="
            rounded-2xl
            border border-gray-200
            bg-[#fafafa]
            p-4
          ">

            <div className="flex items-center gap-2">

              <div className="
                flex h-8 w-8
                items-center justify-center
                rounded-lg
                bg-[#fbc531]
              ">
                <Bot size={16} />
              </div>

              <div>
                <p className="text-xs font-bold">
                  Local AI
                </p>

                <p className="text-[10px] text-gray-400">
                  Powered by Ollama
                </p>
              </div>

            </div>

          </div>

        </div>

      </aside>

      {/* ==================================================
          MAIN AREA
      ================================================== */}

      <section className="lg:ml-[270px]">

        {/* HEADER */}

        <header className="
          sticky top-0 z-30
          flex h-[70px]
          items-center justify-between
          border-b border-gray-200
          bg-white/95
          px-4
          backdrop-blur-xl
          sm:px-6
        ">

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                setSidebarOpen(true)
              }
              className="
                rounded-xl
                p-2
                text-gray-600
                hover:bg-gray-100
                lg:hidden
              "
            >
              <Menu size={20} />
            </button>

            <div>
              <p className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.15em]
                text-gray-400
              ">
                Study Session
              </p>

              <h2 className="text-sm font-bold">
                AI Study Chat
              </h2>
            </div>

          </div>

          {/* PROVIDER */}

          <div className="relative">

            <button
              onClick={() =>
                setProviderOpen(
                  (value) => !value
                )
              }
              className="
                flex items-center
                gap-2
                rounded-xl
                border border-gray-200
                bg-white
                px-3 py-2
                text-sm
                font-semibold
                shadow-sm
                hover:border-gray-300
              "
            >

              <span
                className={`
                  h-2.5 w-2.5
                  rounded-full
                  ${
                    provider === "openai"
                      ? "bg-emerald-500"
                      : "bg-blue-500"
                  }
                `}
              />

              <span className="hidden sm:inline">
                {providerName}
              </span>

              <ChevronDown
                size={14}
                className="text-gray-400"
              />

            </button>

            {providerOpen && (

              <div className="
                absolute right-0 top-12
                z-50 w-44
                rounded-2xl
                border border-gray-200
                bg-white
                p-1.5
                shadow-xl
              ">

                <button
                  onClick={() => {
                    setProvider("gemini");
                    setProviderOpen(false);
                  }}
                  className={`
                    flex w-full
                    items-center gap-3
                    rounded-xl
                    px-3 py-2.5
                    text-left
                    text-sm
                    ${
                      provider === "gemini"
                        ? "bg-[#fff7d6] font-bold text-gray-900"
                        : "text-gray-600 hover:bg-gray-50"
                    }
                  `}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  Gemini
                </button>

                <button
                  onClick={() => {
                    setProvider("openai");
                    setProviderOpen(false);
                  }}
                  className={`
                    flex w-full
                    items-center gap-3
                    rounded-xl
                    px-3 py-2.5
                    text-left
                    text-sm
                    ${
                      provider === "openai"
                        ? "bg-[#fff7d6] font-bold text-gray-900"
                        : "text-gray-600 hover:bg-gray-50"
                    }
                  `}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  ChatGPT
                </button>

              </div>
            )}

          </div>

        </header>

        {/* CHAT CONTENT */}

        <div className="
          mx-auto
          max-w-4xl
          px-4
          sm:px-6
        ">

          {messages.length === 0 ? (

            <Welcome
              provider={providerName}
              onSuggestion={startSuggestion}
            />

          ) : (

            <div className="space-y-7 py-8 pb-48">

              {messages.map(
                (item, index) => (

                  <ChatBubble
                    key={index}
                    item={item}
                    index={index}
                    copied={
                      copiedIndex === index
                    }
                    onCopy={
                      copyResponse
                    }
                  />

                )
              )}

              {loading && (
                <Typing />
              )}

              <div ref={bottomRef} />

            </div>
          )}

        </div>

      </section>

      {/* ==================================================
          COMPOSER
      ================================================== */}

      <div className="
        fixed bottom-0
        left-0 right-0
        z-20
        lg:left-[270px]
      ">

        <div className="
          pointer-events-none
          absolute inset-x-0
          bottom-0 h-32
          bg-gradient-to-t
          from-[#f7f8fa]
          via-[#f7f8fa]/90
          to-transparent
        " />

        <div className="
          relative
          mx-auto
          max-w-4xl
          px-4 pb-4
          sm:px-6
        ">

          <div className="
            rounded-2xl
            border border-gray-200
            bg-white
            p-2
            shadow-[0_12px_40px_rgba(0,0,0,0.10)]
            focus-within:border-[#e4b927]
            focus-within:ring-4
            focus-within:ring-yellow-100
          ">

            <div className="flex items-end gap-2">

              <textarea
                ref={textareaRef}
                value={message}
                onChange={(event) =>
                  setMessage(
                    event.target.value
                  )
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your studies..."
                rows={1}
                className="
                  max-h-40
                  min-h-[50px]
                  flex-1
                  resize-none
                  bg-transparent
                  px-4 py-3
                  text-sm
                  leading-6
                  text-gray-900
                  outline-none
                  placeholder:text-gray-400
                "
              />

              <button
                onClick={() =>
                  sendMessage()
                }
                disabled={
                  !message.trim() ||
                  loading
                }
                className="
                  flex h-11 w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#fbc531]
                  text-black
                  transition
                  hover:scale-105
                  hover:shadow-md
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                  disabled:hover:scale-100
                "
              >
                <Send
                  size={18}
                  strokeWidth={2.5}
                />
              </button>

            </div>

          </div>

          <p className="
            mt-2
            text-center
            text-[10px]
            text-gray-400
          ">
            StudyMate AI • Powered by Ollama
          </p>

        </div>
      </div>

    </main>
  );
}


/* ============================================================
   WELCOME
============================================================ */

function Welcome({
  provider,
  onSuggestion,
}) {
  return (
    <div className="
      flex min-h-[calc(100vh-70px)]
      flex-col
      items-center
      justify-center
      pb-36
      pt-8
    ">

      <div className="
        mb-6
        flex h-16 w-16
        items-center justify-center
        rounded-2xl
        bg-[#fbc531]
        text-black
        shadow-[0_10px_30px_rgba(251,197,49,0.25)]
      ">
        <Sparkles size={29} />
      </div>

      <div className="text-center">

        <div className="
          mb-5
          inline-flex
          items-center gap-2
          rounded-full
          border border-gray-200
          bg-white
          px-4 py-2
          text-xs
          font-semibold
          text-gray-500
          shadow-sm
        ">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          {provider} • Ollama
        </div>

        <h1 className="
          text-4xl
          font-black
          tracking-tight
          text-gray-950
          sm:text-5xl
        ">
          How can I help you study?
        </h1>

        <p className="
          mx-auto
          mt-4
          max-w-xl
          text-sm
          leading-7
          text-gray-500
        ">
          Ask questions, understand difficult concepts,
          prepare for exams, or learn through practical
          examples.
        </p>

      </div>

      <div className="
        mt-10
        grid
        w-full
        max-w-3xl
        gap-3
        sm:grid-cols-2
        lg:grid-cols-3
      ">

        <Suggestion
          icon={<WandSparkles size={18} />}
          title="Understand a concept"
          text="Explain a difficult university topic in simple terms."
          prompt="Explain a difficult university topic in simple terms with a clear real-world example."
          onClick={onSuggestion}
        />

        <Suggestion
          icon={<GraduationIcon />}
          title="Exam preparation"
          text="Prepare important concepts and exam questions."
          prompt="Help me prepare for a university exam with important concepts, likely questions, answer structure, and common mistakes."
          onClick={onSuggestion}
        />

        <Suggestion
          icon={<Sparkles size={18} />}
          title="Real-world examples"
          text="Connect theory with practical applications."
          prompt="Explain this concept using practical examples from technology, industry, workplace situations, or everyday life."
          onClick={onSuggestion}
        />

        <Suggestion
          icon={<Bot size={18} />}
          title="Step-by-step learning"
          text="Start from fundamentals and progress gradually."
          prompt="Teach me this topic step by step, starting with the fundamentals and gradually moving to advanced concepts."
          onClick={onSuggestion}
        />

        <Suggestion
          icon={<MessageSquare size={18} />}
          title="Practice questions"
          text="Test your understanding with questions."
          prompt="Give me university-level practice questions on this topic and evaluate my answers."
          onClick={onSuggestion}
        />

        <Suggestion
          icon={<Copy size={18} />}
          title="Quick revision"
          text="Review the most important points quickly."
          prompt="Create a concise revision guide containing key concepts, important points, formulas, examples, and common mistakes."
          onClick={onSuggestion}
        />

      </div>
    </div>
  );
}


/* ============================================================
   SUGGESTION
============================================================ */

function Suggestion({
  icon,
  title,
  text,
  prompt,
  onClick,
}) {
  return (
    <button
      onClick={() => onClick(prompt)}
      className="
        group
        rounded-2xl
        border border-gray-200
        bg-white
        p-5
        text-left
        shadow-sm
        transition
        duration-200
        hover:-translate-y-1
        hover:border-[#fbc531]
        hover:shadow-lg
      "
    >

      <div className="
        mb-4
        flex h-10 w-10
        items-center justify-center
        rounded-xl
        bg-[#fff7d6]
        text-[#bd8900]
        transition
        group-hover:bg-[#fbc531]
        group-hover:text-black
      ">
        {icon}
      </div>

      <h3 className="
        text-sm
        font-bold
        text-gray-900
      ">
        {title}
      </h3>

      <p className="
        mt-2
        text-xs
        leading-5
        text-gray-500
      ">
        {text}
      </p>

    </button>
  );
}


/* ============================================================
   CHAT BUBBLE
============================================================ */

function ChatBubble({
  item,
  index,
  copied,
  onCopy,
}) {
  const isUser =
    item.role === "user";

  return (
    <div
      className={`
        flex gap-3
        ${
          isUser
            ? "justify-end"
            : "justify-start"
        }
      `}
    >

      {!isUser && (
        <div className="
          flex h-9 w-9
          shrink-0
          items-center justify-center
          rounded-xl
          bg-[#fbc531]
          text-black
          shadow-sm
        ">
          <Bot size={18} />
        </div>
      )}

      <div
        className={`
          min-w-0
          ${
            isUser
              ? "max-w-[82%] sm:max-w-[70%]"
              : "w-full max-w-[850px]"
          }
        `}
      >

        <div
          className={`
            rounded-2xl
            px-5 py-4
            text-sm
            leading-7
            ${
              isUser
                ? "rounded-br-md bg-[#fbc531] text-black shadow-sm"
                : item.error
                ? "rounded-bl-md border border-red-200 bg-red-50 text-red-700"
                : "rounded-bl-md border border-gray-200 bg-white text-gray-800 shadow-sm"
            }
          `}
        >

          {isUser ? (

            <p className="
              whitespace-pre-wrap
              break-words
            ">
              {item.content}
            </p>

          ) : (

            <AIText content={item.content} />

          )}

        </div>

        {!isUser &&
          !item.error && (

            <button
              onClick={() =>
                onCopy(
                  item.content,
                  index
                )
              }
              className="
                mt-2
                flex items-center gap-1.5
                px-1
                text-[11px]
                text-gray-400
                hover:text-gray-700
              "
            >
              <Copy size={13} />

              {copied
                ? "Copied"
                : "Copy"}
            </button>

          )}

      </div>

      {isUser && (
        <div className="
          flex h-9 w-9
          shrink-0
          items-center justify-center
          rounded-xl
          border border-gray-200
          bg-white
          text-gray-500
        ">
          <User size={17} />
        </div>
      )}

    </div>
  );
}


/* ============================================================
   SIMPLE AI TEXT FORMATTER
============================================================ */

function AIText({ content }) {
  if (!content) {
    return null;
  }

  const lines =
    content.split("\n");

  return (
    <div className="space-y-2">

      {lines.map((line, index) => {

        const trimmed =
          line.trim();

        if (!trimmed) {
          return (
            <div
              key={index}
              className="h-2"
            />
          );
        }

        // Heading
        if (
          trimmed.startsWith("#")
        ) {
          const heading =
            trimmed.replace(
              /^#+\s*/,
              ""
            );

          return (
            <h3
              key={index}
              className="
                mt-4
                text-base
                font-extrabold
                text-gray-950
              "
            >
              {heading}
            </h3>
          );
        }

        // Bullet
        if (
          trimmed.startsWith("- ") ||
          trimmed.startsWith("* ")
        ) {
          return (
            <div
              key={index}
              className="flex gap-2"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d49d00]" />

              <span>
                {formatBold(
                  trimmed.substring(2)
                )}
              </span>
            </div>
          );
        }

        // Numbered list
        if (
          /^\d+\.\s/.test(trimmed)
        ) {
          const match =
            trimmed.match(
              /^(\d+)\.\s(.*)$/
            );

          return (
            <div
              key={index}
              className="flex gap-3"
            >
              <span className="
                font-bold
                text-[#c28c00]
              ">
                {match[1]}.
              </span>

              <span>
                {formatBold(
                  match[2]
                )}
              </span>
            </div>
          );
        }

        // Code-like line
        if (
          trimmed.startsWith("```")
        ) {
          return null;
        }

        return (
          <p
            key={index}
            className="break-words"
          >
            {formatBold(trimmed)}
          </p>
        );
      })}

    </div>
  );
}


/* ============================================================
   BOLD FORMATTER
============================================================ */

function formatBold(text) {
  const parts =
    text.split(/(\*\*.*?\*\*)/g);

  return parts.map(
    (part, index) => {

      if (
        part.startsWith("**") &&
        part.endsWith("**")
      ) {
        return (
          <strong
            key={index}
            className="font-bold text-gray-950"
          >
            {part.slice(2, -2)}
          </strong>
        );
      }

      return (
        <span key={index}>
          {part}
        </span>
      );
    }
  );
}


/* ============================================================
   TYPING
============================================================ */

function Typing() {
  return (
    <div className="flex items-center gap-3">

      <div className="
        flex h-9 w-9
        items-center justify-center
        rounded-xl
        bg-[#fbc531]
        text-black
      ">
        <Bot size={18} />
      </div>

      <div className="
        rounded-2xl
        rounded-bl-md
        border border-gray-200
        bg-white
        px-5 py-4
        shadow-sm
      ">

        <div className="flex gap-1.5">

          <span className="
            h-2 w-2
            animate-bounce
            rounded-full
            bg-gray-400
          " />

          <span className="
            h-2 w-2
            animate-bounce
            rounded-full
            bg-gray-400
            [animation-delay:150ms]
          " />

          <span className="
            h-2 w-2
            animate-bounce
            rounded-full
            bg-gray-400
            [animation-delay:300ms]
          " />

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   GRADUATION ICON
============================================================ */

function GraduationIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
      <path d="M22 10v6" />
    </svg>
  );
}