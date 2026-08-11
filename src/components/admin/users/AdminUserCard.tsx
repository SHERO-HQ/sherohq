"use client";

import React from "react";
import {
  MoreVertical,
  KeyRound,
  Ban,
  CircleCheck,
  Trash2,
  Mail,
  Phone,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import AppImage from "@/components/common/AppImage";

export type RoleConfigType = Record<
  string,
  { label: string; icon: LucideIcon; color: string; bgColor: string }
>;

interface AdminUserCardProps {
  user: {
    id: string;
    username: string;
    email: string;
    phone?: string | null;
    role: string;
    avatar?: string | null;
    isActive?: boolean;
    createdAt?: string;
  };
  roleConfig: RoleConfigType;
  currentAdminId?: string;
  canManageRoles: boolean;
  isSuperAdmin: boolean;
  onUpdateRole: (id: string, role: string) => void;
  onSetResetPasswordId: (id: string) => void;
  onToggleActive: (userId: string, isActive: boolean) => void;
  onSetDeleteId: (id: string) => void;
}

export function AdminUserCard({
  user,
  roleConfig,
  currentAdminId,
  canManageRoles,
  isSuperAdmin,
  onUpdateRole,
  onSetResetPasswordId,
  onToggleActive,
  onSetDeleteId,
}: AdminUserCardProps) {
  const config = roleConfig[user.role] || roleConfig.clerk;
  const RoleIcon = config.icon;

  return (
    <div className="group relative bg-card/40 border border-border rounded p-6 hover:border-brand-secondary-500/30 transition duration-500">
      <div className="absolute top-4 right-4 ring-offset-slate-950">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-card border-border text-muted-foreground"
          >
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-accent/50" />
            {canManageRoles && user.id !== currentAdminId && (
              <>
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground py-1">
                  Change Role
                </DropdownMenuLabel>
                {Object.entries(roleConfig).map(([role, cfg]) => {
                  if (role === "superadmin" && !isSuperAdmin) return null;
                  if (user.role === "superadmin" && !isSuperAdmin) return null;

                  return (
                    <DropdownMenuItem
                      key={role}
                      onClick={() => onUpdateRole(user.id, role)}
                      className={cn(
                        "flex items-center gap-2 cursor-pointer hover:bg-accent",
                        user.role === role &&
                          "text-brand-secondary-400 bg-brand-secondary-500/5",
                      )}
                    >
                      <cfg.icon className={cn("w-3.5 h-3.5", cfg.color)} />
                      {cfg.label}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator className="bg-accent/50" />
                <DropdownMenuItem
                  onClick={() => onSetResetPasswordId(user.id)}
                  className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  Force Password Reset
                </DropdownMenuItem>
                {isSuperAdmin && (
                  <DropdownMenuItem
                    onClick={() =>
                      onToggleActive(user.id, !user.isActive)
                    }
                    className={cn(
                      "cursor-pointer",
                      user.isActive !== false
                        ? "text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                        : "text-brand-secondary-400 hover:text-brand-secondary-300 hover:bg-brand-secondary-500/10",
                    )}
                  >
                    {user.isActive !== false ? (
                      <>
                        <Ban className="w-4 h-4 mr-2" /> Deactivate Account
                      </>
                    ) : (
                      <>
                        <CircleCheck className="w-4 h-4 mr-2" /> Reactivate
                        Account
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                {isSuperAdmin && (
                  <DropdownMenuItem
                    onClick={() => onSetDeleteId(user.id)}
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete User
                  </DropdownMenuItem>
                )}
              </>
            )}
            <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent">
              <a href={`mailto:${user.email}`}>
                <Mail className="w-4 h-4 mr-2" />
                Email User
              </a>
            </DropdownMenuItem>
            {user.phone && (
              <DropdownMenuItem
                asChild
                className="cursor-pointer hover:bg-accent"
              >
                <a href={`tel:${user.phone}`}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call User
                </a>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-start gap-4">
        <div className="relative">
          <div className="relative w-14 h-14 rounded bg-muted flex items-center justify-center text-xl font-bold text-foreground overflow-hidden border border-border shadow-inner">
            {user.avatar ? (
              <AppImage
                src={user.avatar}
                alt={user.username}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              user.username.charAt(0).toUpperCase()
            )}
          </div>
          <div
            className={cn(
              "absolute -bottom-1 -right-1 p-1 rounded border border-slate-950",
              config.bgColor,
            )}
          >
            <RoleIcon className={cn("w-3 h-3", config.color)} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-foreground truncate tracking-tight">
              {user.username}
            </h3>
            {user.isActive === false && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400">
                <Ban className="w-2.5 h-2.5" /> Inactive
              </span>
            )}
          </div>
          <a
            href={`mailto:${user.email}`}
            className="text-xs text-muted-foreground hover:text-brand-secondary-400 transition-colors truncate mb-1 block"
          >
            {user.email}
          </a>
          {user.phone && (
            <a
              href={`tel:${user.phone}`}
              className="text-[10px] text-muted-foreground hover:text-brand-secondary-400 transition-colors truncate flex items-center gap-1 mb-2"
            >
              <Phone className="w-3 h-3 text-slate-600" />
              {user.phone}
            </a>
          )}
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-bold border-transparent uppercase tracking-wider",
              config.bgColor,
              config.color,
            )}
          >
            {config.label}
          </Badge>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-[10px] font-medium uppercase tracking-tight">
            {user.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
        {user.id === currentAdminId && (
          <div className="flex justify-end">
            <Badge className="bg-brand-secondary-500/20 text-brand-secondary-400 hover:bg-brand-secondary-500/20 border-none text-[9px]">
              YOU
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
