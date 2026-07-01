"use client";

import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DatePickerSize = "md" | "lg";

type DatePickerProps = {
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: DatePickerSize;
  className?: string;
};

function toDate(value?: string | null) {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value?: string | null) {
  const date = toDate(value);
  if (!date) return "";
  return date.toLocaleDateString("vi-VN");
}

const sizeClass: Record<DatePickerSize, string> = {
  md: "h-10",
  lg: "h-11",
};

export function DatePicker({
  value,
  onChange,
  placeholder = "Chọn ngày",
  disabled,
  size = "md",
  className,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start px-3 text-left font-normal bg-[#F8F8F7] border-[#E8E7E2] text-foreground hover:bg-gray-100",
            sizeClass[size],
            !value && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate" style={{ fontSize: 13 }}>
            {value ? formatDate(value) : placeholder}
          </span>
          <CalendarIcon className="ml-auto size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white" align="start">
        <Calendar
          mode="single"
          selected={toDate(value)}
          onSelect={(date) => onChange(date ? toDateValue(date) : "")}
          disabled={(date) => date < new Date("1900-01-01")}
        />
      </PopoverContent>
    </Popover>
  );
}
