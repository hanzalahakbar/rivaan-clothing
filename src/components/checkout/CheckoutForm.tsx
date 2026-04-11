"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { isValidPhoneNumber, type CheckoutData } from "@/lib/services/whatsapp.service";

interface CheckoutFormProps {
  onSubmit: (data: CheckoutData) => void;
  isSubmitting?: boolean;
}

interface FormErrors {
  name?: string;
  phone?: string;
  city?: string;
  address?: string;
}

export function CheckoutForm({ onSubmit, isSubmitting = false }: CheckoutFormProps) {
  const [formData, setFormData] = useState<CheckoutData>({
    name: "",
    phone: "",
    city: "",
    address: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: keyof CheckoutData, value: string): string | undefined => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        return undefined;
      case "phone":
        if (!value.trim()) return "Phone number is required";
        if (!isValidPhoneNumber(value)) return "Please enter a valid phone number";
        return undefined;
      case "city":
        if (!value.trim()) return "City is required";
        return undefined;
      case "address":
        if (!value.trim()) return "Address is required";
        if (value.trim().length < 10) return "Please enter a complete address";
        return undefined;
      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    (["name", "phone", "city", "address"] as const).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate on blur
    const error = validateField(name as keyof CheckoutData, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ name: true, phone: true, city: true, address: true });

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name *"
        name="name"
        value={formData.name}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.name ? errors.name : undefined}
        placeholder="Enter your full name"
        disabled={isSubmitting}
        autoComplete="name"
      />

      <Input
        label="Phone Number *"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.phone ? errors.phone : undefined}
        placeholder="+1 234 567 8900"
        disabled={isSubmitting}
        autoComplete="tel"
      />

      <Input
        label="City *"
        name="city"
        value={formData.city}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.city ? errors.city : undefined}
        placeholder="Enter your city"
        disabled={isSubmitting}
        autoComplete="address-level2"
      />

      <div className="w-full">
        <label
          htmlFor="address"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Delivery Address *
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter your complete delivery address"
          disabled={isSubmitting}
          autoComplete="street-address"
          rows={3}
          className={`flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm
            ring-offset-background placeholder:text-muted-foreground
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-out resize-none
            ${touched.address && errors.address ? "border-destructive focus-visible:ring-destructive" : ""}`}
        />
        {touched.address && errors.address && (
          <p className="mt-1.5 text-sm text-destructive" role="alert">
            {errors.address}
          </p>
        )}
      </div>

      <div className="w-full">
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Order Notes (Optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any special instructions or requests..."
          disabled={isSubmitting}
          rows={2}
          className="flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm
            ring-offset-background placeholder:text-muted-foreground
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-out resize-none"
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full gap-2 mt-6"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Place Order via WhatsApp
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        You&apos;ll be redirected to WhatsApp to complete your order
      </p>
    </form>
  );
}
