"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TimePickerProps {
  time?: string; // Format: "HH:mm" (24-hour)
  onTimeChange?: (time: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minTime?: string;
  maxTime?: string;
}

export function TimePicker({
  time,
  onTimeChange,
  placeholder = "Pilih waktu",
  disabled = false,
  className,
  minTime,
  maxTime,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse initial time to 12-hour format
  const parseTime = (time24?: string) => {
    if (!time24) return { hour: "09", minute: "00", period: "AM" };
    const [h24, m] = time24.split(":");
    const hour24 = parseInt(h24);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const period = hour24 >= 12 ? "PM" : "AM";
    return {
      hour: hour12.toString().padStart(2, "0"),
      minute: m,
      period,
    };
  };

  const initialParsed = parseTime(time);
  const [selectedHour, setSelectedHour] = React.useState<string>(initialParsed.hour);
  const [selectedMinute, setSelectedMinute] = React.useState<string>(initialParsed.minute);
  const [selectedPeriod, setSelectedPeriod] = React.useState<"AM" | "PM">(initialParsed.period as "AM" | "PM");

  // Generate hours (01-12 for 12-hour format)
  const hours = Array.from({ length: 12 }, (_, i) => {
    const hour = (i + 1).toString().padStart(2, "0");
    return hour;
  });

  // Generate minutes (00, 15, 30, 45)
  const minutes = ["00", "15", "30", "45"];

  // Update local state when time prop changes
  React.useEffect(() => {
    if (time) {
      const parsed = parseTime(time);
      setSelectedHour(parsed.hour);
      setSelectedMinute(parsed.minute);
      setSelectedPeriod(parsed.period as "AM" | "PM");
    }
  }, [time]);

  // Convert 12-hour to 24-hour format
  const convert12to24 = (hour12: string, minute: string, period: "AM" | "PM"): string => {
    let hour24 = parseInt(hour12);

    if (period === "AM") {
      if (hour24 === 12) hour24 = 0; // 12 AM = 00:00
    } else {
      if (hour24 !== 12) hour24 += 12; // PM adds 12, except 12 PM stays 12
    }

    return `${hour24.toString().padStart(2, "0")}:${minute}`;
  };

  const handleConfirm = () => {
    const time24 = convert12to24(selectedHour, selectedMinute, selectedPeriod);

    // Check time constraints
    if (minTime && time24 < minTime) return;
    if (maxTime && time24 > maxTime) return;

    onTimeChange?.(time24);
    setOpen(false);
  };

  const handleClear = () => {
    onTimeChange?.(undefined);
    setSelectedHour("09");
    setSelectedMinute("00");
    setSelectedPeriod("AM");
    setOpen(false);
  };

  // Format display time
  const displayTime = time ? (() => {
    const parsed = parseTime(time);
    return `${parsed.hour}:${parsed.minute} ${parsed.period}`;
  })() : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !displayTime && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayTime ? (
            <span>{displayTime}</span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Hours Column */}
          <div className="border-r">
            <div className="px-3 py-2 text-xs font-medium border-b bg-muted/50 text-center">
              Jam
            </div>
            <ScrollArea className="h-[200px]">
              <div className="p-1">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => setSelectedHour(hour)}
                    className={cn(
                      "w-full px-3 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground text-center transition-colors",
                      selectedHour === hour &&
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-medium"
                    )}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Minutes Column */}
          <div className="border-r">
            <div className="px-3 py-2 text-xs font-medium border-b bg-muted/50 text-center">
              Menit
            </div>
            <ScrollArea className="h-[200px]">
              <div className="p-1">
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => setSelectedMinute(minute)}
                    className={cn(
                      "w-full px-3 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground text-center transition-colors",
                      selectedMinute === minute &&
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-medium"
                    )}
                  >
                    {minute}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* AM/PM Column */}
          <div>
            <div className="px-3 py-2 text-xs font-medium border-b bg-muted/50 text-center">
              Period
            </div>
            <div className="p-1 space-y-1 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPeriod("AM")}
                className={cn(
                  "w-full px-3 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground text-center transition-colors",
                  selectedPeriod === "AM" &&
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-medium"
                )}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod("PM")}
                className={cn(
                  "w-full px-3 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground text-center transition-colors",
                  selectedPeriod === "PM" &&
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-medium"
                )}
              >
                PM
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 p-2 border-t bg-muted/50">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8"
            onClick={handleClear}
          >
            Clear
          </Button>
          <Button
            size="sm"
            className="flex-1 h-8"
            onClick={handleConfirm}
          >
            OK
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
