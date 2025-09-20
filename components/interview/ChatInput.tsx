// app/components/interview/ChatInput.tsx
"use client";

import { KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ value, onChange, disabled, placeholder = "Type your answer..." }: ChatInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // The parent component's form `onSubmit` handles the submission.
      // So, no need to manually call `onSend`.
    }
  };

  return (
    <div className="flex w-full items-center gap-2">
      <textarea
        className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        rows={2}
        disabled={disabled}
      />
      {/* The button is handled by the parent form's submit event */}
      {/* You can remove this button if you prefer submitting by pressing Enter */}
      {/* <Button type="submit" disabled={disabled || !value.trim()}>
        <Send className="h-4 w-4" />
      </Button> */}
    </div>
  );
}

