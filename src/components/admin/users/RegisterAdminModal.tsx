"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RoleConfigType } from "./AdminUserCard";

interface RegisterAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    username: string;
    email: string;
    password: string;
    phone: string;
    role: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      username: string;
      email: string;
      password: string;
      phone: string;
      role: string;
    }>
  >;
  handleRegister: (e: React.BaseSyntheticEvent) => Promise<void>;
  isPending: boolean;
  roleConfig: RoleConfigType;
  isSuperAdmin: boolean;
}

export function RegisterAdminModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  handleRegister,
  isPending,
  roleConfig,
  isSuperAdmin,
}: RegisterAdminModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Admin User"
    >
      <form onSubmit={handleRegister} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="reg-username" className="text-muted-foreground">
            Username
          </Label>
          <Input
            id="reg-username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
            placeholder="e.g. john_doe"
            className="bg-card border-border text-foreground placeholder:text-muted-foreground focus:ring-brand-secondary-500/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-email" className="text-muted-foreground">
            Email Address
          </Label>
          <Input
            id="reg-email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            placeholder="john@example.com"
            className="bg-card border-border text-foreground placeholder:text-muted-foreground focus:ring-brand-secondary-500/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-phone" className="text-muted-foreground">
            Phone Number (Optional)
          </Label>
          <Input
            id="reg-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="02XXXXXXXX or 05XXXXXXXX"
            className="bg-card border-border text-foreground placeholder:text-muted-foreground focus:ring-brand-secondary-500/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-password" className="text-muted-foreground">
            Temporary Password
          </Label>
          <Input
            id="reg-password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            placeholder="••••••••"
            className="bg-card border-border text-foreground placeholder:text-muted-foreground focus:ring-brand-secondary-500/20"
          />
          <p className="text-[10px] text-muted-foreground">
            Min 8 characters — requires uppercase, lowercase, and a number.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-role" className="text-muted-foreground">
            Assigned Role
          </Label>
          <select
            id="reg-role"
            value={formData.role}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value })
            }
            className="w-full bg-card border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand-secondary-500/20 appearance-none"
          >
            {Object.entries(roleConfig).map(([role, cfg]) => {
              if (role === "superadmin" && !isSuperAdmin) return null;
              return (
                <option key={role} value={role}>
                  {cfg.label}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground min-w-30"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Create User"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
