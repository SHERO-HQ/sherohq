"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
    Bell,
    Check,
    Trash2,
    Info,
    AlertTriangle,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { type Notification } from "@/types/notification";
import { cn } from "@/lib/utils";

export default function NotificationCenter() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
        useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function getIcon(type: Notification["type"]) {
        switch (type) {
            case "success":
                return <CheckCircle className="w-5 h-5 text-brand-secondary-400" />;
            case "warning":
                return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
            case "error":
                return <XCircle className="w-5 h-5 text-red-400" />;
            default:
                return <Info className="w-5 h-5 text-blue-400" />;
        }
    }

    function formatTime(dateString: string) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds

        if (diff < 60) return "Just now";
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative p-2 rounded transition duration-300",
                    isOpen
                        ? "bg-brand-secondary-500/10 text-brand-secondary-600 dark:text-brand-secondary-400 border-brand-secondary-500/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    "border border-border",
                )}
                title="Notifications"
            >
                <Bell className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-secondary-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-secondary-500 ring-2 ring-background" />
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-surface rounded shadow z-50 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">
                            Notifications
                        </h3>
                        {notifications.length > 0 && (
                            <div className="flex gap-2">
                                <button
                                    onClick={markAllAsRead}
                                    className="p-1.5 text-muted-foreground hover:text-brand-secondary-500 dark:hover:text-brand-secondary-400 hover:bg-muted rounded transition-colors"
                                    title="Mark all as read"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={clearAll}
                                    className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-muted rounded transition-colors"
                                    title="Clear all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p>No notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 flex gap-3 hover:bg-muted/50 transition-colors ${!notification.read ? "bg-muted/20" : ""
                                            }`}
                                    >
                                        <div className="mt-1">{getIcon(notification.type)}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4
                                                    className={`text-sm font-medium ${notification.read ? "text-muted-foreground" : "text-foreground"
                                                        }`}
                                                >
                                                    {notification.title}
                                                </h4>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                                    {formatTime(notification.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                                                {notification.message}
                                            </p>
                                            {notification.link && (
                                                <Link
                                                    href={notification.link}
                                                    onClick={() => {
                                                        markAsRead(notification.id);
                                                        setIsOpen(false);
                                                    }}
                                                    className="text-xs text-brand-secondary-600 dark:text-brand-secondary-400 hover:text-brand-secondary-500 font-medium"
                                                >
                                                    View Details →
                                                </Link>
                                            )}
                                        </div>
                                        {!notification.read && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className="self-start mt-1 w-2 h-2 rounded-full bg-brand-secondary-500"
                                                title="Mark as read"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
