"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { User, Mail, Phone, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
}

interface InvoiceCustomerCardProps {
  customer: CustomerInfo;
  onUpdateCustomer: (updates: Partial<CustomerInfo>) => void;
  errors?: Record<string, string>;
}

export default function InvoiceCustomerCard({
  customer,
  onUpdateCustomer,
  errors = {},
}: InvoiceCustomerCardProps) {
  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    onUpdateCustomer({ [field]: value });
  };

  return (
    <Card className={cn(
      "bg-card border border-border p-6 md:p-8 space-y-6 transition-all duration-300",
      (errors.firstName || errors.email || errors.address) && "border-rose-500/30 bg-rose-500/2"
    )}>
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <User className="w-5 h-5 text-brand-secondary-400" />
        <h3 className="text-lg font-bold text-foreground">Customer Information</h3>
      </div>

      <div className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="firstName"
              className="text-sm font-medium text-muted-foreground"
            >
              First Name *
            </label>
            <Input
              id="firstName"
              placeholder="John"
              value={customer.firstName || ""}
              autoComplete="off"
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className={cn(
                "bg-muted/50 border-border text-foreground focus-visible:ring-brand-secondary-500",
                errors.firstName && "border-rose-500 bg-rose-500/5 focus-visible:ring-rose-500"
              )}
              required
            />
            {errors.firstName && (
              <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 opacity-100 mt-1">
                {errors.firstName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="lastName"
              className="text-sm font-medium text-muted-foreground"
            >
              Last Name
            </label>
            <Input
              id="lastName"
              placeholder="Doe"
              value={customer.lastName || ""}
              autoComplete="off"
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="bg-muted/50 border-border text-foreground focus-visible:ring-brand-secondary-500"
            />
          </div>
        </div>

        {/* Contact Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-muted-foreground flex items-center gap-1.5"
            >
              Email Address * <Mail className="w-3.5 h-3.5 text-muted-foreground" />
            </label>
            <Input
              id="email"
              type="email"
              placeholder="john@sherohq.com"
              value={customer.email || ""}
              autoComplete="off"
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={cn(
                "bg-muted/50 border-border text-foreground focus-visible:ring-brand-secondary-500",
                errors.email && "border-rose-500 bg-rose-500/5 focus-visible:ring-rose-500"
              )}
              required
            />
            {errors.email && (
              <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 opacity-100 mt-1">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="text-sm font-medium text-muted-foreground flex items-center gap-1.5"
            >
              Phone Number <Phone className="w-3.5 h-3.5 text-muted-foreground" />
            </label>
            <Input
              id="phone"
              placeholder="+233 54 123 4567"
              value={customer.phone || ""}
              autoComplete="off"
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="bg-muted/50 border-border text-foreground focus-visible:ring-brand-secondary-500"
            />
          </div>
        </div>

        {/* Address Fields */}
        <div className="space-y-4 pt-2 border-t border-border">
          <div className="space-y-2">
            <label
              htmlFor="address"
              className="text-sm font-medium text-muted-foreground flex items-center gap-1.5"
            >
              Street Address * <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            </label>
            <Input
              id="address"
              placeholder="123 Main St"
              value={customer.address || ""}
              autoComplete="off"
              onChange={(e) => handleInputChange("address", e.target.value)}
              className={cn(
                "bg-muted/50 border-border text-foreground focus-visible:ring-brand-secondary-500",
                errors.address && "border-rose-500 bg-rose-500/5 focus-visible:ring-rose-500"
              )}
              required
            />
            {errors.address && (
              <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 opacity-100 mt-1">
                {errors.address}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="city"
                className="text-sm font-medium text-muted-foreground"
              >
                City
              </label>
              <Input
                id="city"
                placeholder="Accra"
                value={customer.city || ""}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className="bg-muted/50 border-border text-foreground focus-visible:ring-brand-secondary-500"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="region"
                className="text-sm font-medium text-muted-foreground"
              >
                Region
              </label>
              <Input
                id="region"
                placeholder="Greater Accra"
                value={customer.region || ""}
                onChange={(e) => handleInputChange("region", e.target.value)}
                className="bg-muted/50 border-border text-foreground focus-visible:ring-brand-secondary-500"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
