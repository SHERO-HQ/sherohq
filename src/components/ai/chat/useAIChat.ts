"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/hooks/queries/useCartQuery";
import { useUser } from "@/hooks/queries/useAuthQuery";
import { useDialog } from "@/hooks/useDialog";
import { type ChatMessage, sendChatMessageStreaming } from "@/services/ai/chat";
import type { Product } from "@/types/product";

type TriggerDetail = {
  message?: string;
  open?: boolean;
};

const INITIAL_ASSISTANT_MESSAGE: ChatMessage = {
  id: "initial",
  role: "assistant",
  content:
    "Hi! I'm your Shero Expert. How can I help you with IT solutions or products today?",
};

export function useAIChat() {
  const pathname = usePathname();
  const { cart, addItem, setIsCartOpen } = useCart();
  const { data: userData } = useUser();
  const user = userData?.user;
  const dialog = useDialog();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [guestId, setGuestId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    INITIAL_ASSISTANT_MESSAGE,
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const isInitialized = useRef(false);
  const messagesRef = useRef<ChatMessage[]>([INITIAL_ASSISTANT_MESSAGE]);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let stored = localStorage.getItem("shero_ai_guest_id");
    if (!stored) {
      stored = "guest_" + crypto.randomUUID();
      localStorage.setItem("shero_ai_guest_id", stored);
    }
    setGuestId(stored);
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    const savedHistory = localStorage.getItem("shoro_chat_history");
    if (savedHistory) {
      try {
        setMessages(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to restore history", e);
      }
    }

    const savedInput = localStorage.getItem("shoro_chat_input");
    if (savedInput) {
      setInput(savedInput);
    }

    setTimeout(() => {
      isInitialized.current = true;
    }, 0);
  }, []);

  useEffect(() => {
    if (!isInitialized.current) return;
    const lightweight = messages
      .slice(-15)
      .map(({ imageData, audioData, ...rest }) => rest);
    localStorage.setItem("shoro_chat_history", JSON.stringify(lightweight));
  }, [messages]);

  useEffect(() => {
    if (!isInitialized.current) return;
    localStorage.setItem("shoro_chat_input", input);
  }, [input]);

  useEffect(() => {
    const handleKeyboardShortcuts = (event: KeyboardEvent) => {
      const key = event?.key?.toLowerCase();
      if (!key) return;

      if ((event.metaKey || event.ctrlKey) && key === "k") {
        event.preventDefault();
        setIsOpen(true);
        setIsMinimized(false);
      }

      if (key === "escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyboardShortcuts);
    return () => {
      window.removeEventListener("keydown", handleKeyboardShortcuts);
    };
  }, [isOpen]);

  const speak = useCallback(
    (text: string) => {
      if (!isSpeaking) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    },
    [isSpeaking],
  );

  const processMessage = useCallback(
    async (text: string, imageData?: string) => {
      const trimmedText = text.trim();
      if (!trimmedText && !imageData) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content:
          trimmedText ||
          "Please analyze this image and help me decide the best option.",
        imageData: imageData,
      };

      const historyForRequest = messagesRef.current.slice(-15);

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      try {
        const assistantMsgId = crypto.randomUUID();
        let fullText = "";

        setMessages((prev) => [
          ...prev,
          { id: assistantMsgId, role: "assistant", content: "" },
        ]);

        const responseMetadata = await sendChatMessageStreaming(
          {
            message: userMessage.content,
            history: historyForRequest,
            imageData: imageData,
            context: {
              currentPath: pathname || "",
              cartItemIds: cart.map((item) => item.id),
              sessionId: user?.id || guestId,
              user: user
                ? { id: user.id, name: user.name, email: user.email }
                : null,
            },
          },
          (chunk) => {
            fullText += chunk;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId ? { ...msg, content: fullText } : msg,
              ),
            );
          },
        );

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, ...responseMetadata } : msg,
          ),
        );

        if (isSpeaking && fullText) speak(fullText);

        if (responseMetadata.cartProduct) {
          let productToAdd = responseMetadata.recommendedProducts?.find((p) =>
            p.name
              .toLowerCase()
              .includes(responseMetadata.cartProduct!.toLowerCase()),
          );

          if (!productToAdd) {
            try {
              const res = await fetch("/api/products");
              if (res.ok) {
                const products: Product[] = await res.json();
                productToAdd = products.find((p) =>
                  p.name
                    .toLowerCase()
                    .includes(responseMetadata.cartProduct!.toLowerCase()),
                );
              }
            } catch (e) {
              console.error(
                "Failed to fetch full catalog for cart addition:",
                e,
              );
            }
          }

          if (productToAdd) {
            addItem({
              id: productToAdd.id,
              name: productToAdd.name,
              price: productToAdd.price,
              image: productToAdd.image,
              category: productToAdd.category,
              sku: productToAdd.sku,
            });
            setIsCartOpen(true);
          }
        }
      } catch (error) {
        console.error("AI chat error", error);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "I hit a temporary issue while processing that. Please retry in a moment.",
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [addItem, isSpeaking, setIsCartOpen, speak, pathname, cart, guestId, user],
  );

  useEffect(() => {
    const handleOpenAiChat = (e: Event) => {
      const customEvent = e as CustomEvent<TriggerDetail>;
      setIsOpen(true);
      setIsMinimized(false);

      if (customEvent.detail?.message) {
        setInput(customEvent.detail.message);

        if (customEvent.detail.open && !isTyping && isInitialized.current) {
          setTimeout(() => {
            void processMessage(customEvent.detail.message!);
            setInput("");
          }, 100);
        }
      }
    };

    window.addEventListener("shero-ai-open", handleOpenAiChat);
    return () => {
      window.removeEventListener("shero-ai-open", handleOpenAiChat);
    };
  }, [isTyping, processMessage]);

  useEffect(() => {
    const handleTrigger = (event: Event) => {
      const customEvent = event as CustomEvent<TriggerDetail>;
      const { message, open = true } = customEvent.detail || {};
      if (open) {
        setIsOpen(true);
        setIsMinimized(false);
      }
      if (message) {
        void processMessage(message);
      }
    };

    window.addEventListener("shoro-ai-trigger", handleTrigger);
    return () => window.removeEventListener("shoro-ai-trigger", handleTrigger);
  }, [processMessage]);

  const clearHistory = async () => {
    if (
      await dialog.confirm(
        "Are you sure you want to clear our conversation history?",
      )
    ) {
      setMessages([INITIAL_ASSISTANT_MESSAGE]);
      localStorage.removeItem("shoro_chat_history");
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;
    const text = input;
    const img = selectedImage || undefined;

    setInput("");
    setSelectedImage(null);
    await processMessage(text, img);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            setSelectedImage(canvas.toDataURL("image/jpeg", 0.7));
          } else {
            setSelectedImage(reader.result as string);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const processVoiceMessage = async (audioData: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: "[Audio Message]",
      audioData: audioData,
    };

    const historyForRequest = messagesRef.current.slice(-15);

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const assistantMsgId = crypto.randomUUID();
      let fullText = "";

      setMessages((prev) => [
        ...prev,
        { id: assistantMsgId, role: "assistant", content: "" },
      ]);

      const responseMetadata = await sendChatMessageStreaming(
        {
          message: userMessage.content,
          history: historyForRequest,
          audioData: audioData,
        },
        (chunk) => {
          fullText += chunk;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: fullText } : msg,
            ),
          );
        },
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId ? { ...msg, ...responseMetadata } : msg,
        ),
      );

      if (isSpeaking && fullText) speak(fullText);
    } catch (error) {
      console.error("Voice processing error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const duration = Date.now() - recordingStartTimeRef.current;
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        if (
          audioChunksRef.current.length === 0 ||
          duration < 500 ||
          audioBlob.size < 1000
        ) {
          stream.getTracks().forEach((track) => track.stop());
          dialog.alert(
            "Audio recording was too short or empty. Please speak a bit longer.",
          );
          return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          await processVoiceMessage(base64Audio);
        };
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.onerror = (event: Event) => {
        console.error("MediaRecorder error:", event);
        setIsRecording(false);
      };

      recorder.start();
      recordingStartTimeRef.current = Date.now();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied or recorder init failed:", err);
      dialog.alert(
        "Microphone access is required for voice input. Please ensure you have granted permission.",
      );
    }
  };

  return {
    pathname,
    cart,
    isOpen,
    setIsOpen,
    isMinimized,
    setIsMinimized,
    messages,
    setMessages,
    input,
    setInput,
    isTyping,
    selectedImage,
    setSelectedImage,
    isRecording,
    isSpeaking,
    setIsSpeaking,
    fileInputRef,
    textInputRef,
    endOfMessagesRef,
    clearHistory,
    handleSend,
    handleFileChange,
    handleVoiceInput,
    processMessage,
  };
}
