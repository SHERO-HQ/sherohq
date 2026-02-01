import {
  FileText,
  Download,
  Monitor,
  Cpu,
  HardDrive,
  Settings,
  Wifi,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SupportGuide {
  id: string;
  title: string;
  description: string;
  category: "hardware" | "software";
  date: string;
  icon: LucideIcon;
  slug: string;
}

export const supportGuides: SupportGuide[] = [
  // Hardware Guides
  {
    id: "hw-1",
    title: "Setting Up Your New Desktop",
    description:
      "Complete guide to unboxing, connecting, and configuring your SHERO desktop computer for first-time use.",
    category: "hardware",
    date: "2026-01-28",
    icon: Monitor,
    slug: "desktop-setup",
  },
  {
    id: "hw-2",
    title: "RAM Upgrade Guide",
    description:
      "Step-by-step instructions for safely upgrading your system's memory for improved performance.",
    category: "hardware",
    date: "2026-01-25",
    icon: Cpu,
    slug: "ram-upgrade",
  },
  {
    id: "hw-3",
    title: "Storage Installation",
    description:
      "How to install and configure additional SSD or HDD storage in your desktop or laptop.",
    category: "hardware",
    date: "2026-01-20",
    icon: HardDrive,
    slug: "storage-installation",
  },
  {
    id: "hw-4",
    title: "Network Troubleshooting",
    description:
      "Diagnose and fix common Wi-Fi and Ethernet connectivity issues on your devices.",
    category: "hardware",
    date: "2026-01-15",
    icon: Wifi,
    slug: "network-troubleshooting",
  },
  // Software Guides
  {
    id: "sw-1",
    title: "Windows Installation Guide",
    description:
      "Clean install Windows 11 with all necessary drivers and software for your SHERO device.",
    category: "software",
    date: "2026-01-27",
    icon: Settings,
    slug: "windows-installation",
  },
  {
    id: "sw-2",
    title: "Driver Updates",
    description:
      "Keep your system running smoothly with the latest driver updates and firmware.",
    category: "software",
    date: "2026-01-22",
    icon: Download,
    slug: "driver-updates",
  },
  {
    id: "sw-3",
    title: "System Security Setup",
    description:
      "Essential security configurations to protect your data and privacy on your new system.",
    category: "software",
    date: "2026-01-18",
    icon: Shield,
    slug: "security-setup",
  },
  {
    id: "sw-4",
    title: "Backup & Recovery",
    description:
      "Set up automatic backups and learn how to recover your system in case of failure.",
    category: "software",
    date: "2026-01-12",
    icon: FileText,
    slug: "backup-recovery",
  },
];

export const getGuidesByCategory = (category: "hardware" | "software") =>
  supportGuides.filter((g) => g.category === category);
