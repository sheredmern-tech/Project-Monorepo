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
  time?: string; // Format: "HH:mm"
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
  const [selectedHour, setSelectedHour] = React.useState<string>(
    time ? time.split(":")[0] : "09"
  );
  const [selectedMinute, setSelectedMinute] = React.useState<string>(
    time ? time.split(":")[1] : "00"
  );

  // Generate hours (00-23)
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return hour;
  });

  // Generate minutes (00, 15, 30, 45)
  const minutes = ["00", "15", "30", "45"];

  // Update time when selection changes
  React.useEffect(() => {
    if (time) {
      const [h, m] = time.split(":");
      setSelectedHour(h);
      setSelectedMinute(m);
    }
  }, [time]);

  const handleTimeSelect = (hour: string, minute: string) => {
    const newTime = `${hour}:${minute}`;

    // Check time constraints
    if (minTime && newTime < minTime) return;
    if (maxTime && newTime > maxTime) return;

    setSelectedHour(hour);
    setSelectedMinute(minute);
    onTimeChange?.(newTime);
    setOpen(false);
  };

  const displayTime = time
    ? `${time.split(":")[0]}:${time.split(":")[1]}`
    : null;

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
            <span>{displayTime} WIB</span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Hours Column */}
          <div className="border-r">
            <div className="px-4 py-2 text-sm font-medium border-b bg-muted/50">
              Jam
            </div>
            <ScrollArea className="h-[240px]">
              <div className="p-1">
                {hours.map((hour) => {
                  const isDisabled =
                    (minTime && `${hour}:${selectedMinute}` < minTime) ||
                    (maxTime && `${hour}:${selectedMinute}` > maxTime);

                  return (
                    <button
                      key={hour}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleTimeSelect(hour, selectedMinute)}
                      className={cn(
                        "w-full px-4 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground text-center transition-colors",
                        selectedHour === hour &&
                          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-medium",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {hour}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Minutes Column */}
          <div>
            <div className="px-4 py-2 text-sm font-medium border-b bg-muted/50">
              Menit
            </div>
            <ScrollArea className="h-[240px]">
              <div className="p-1">
                {minutes.map((minute) => {
                  const isDisabled =
                    (minTime && `${selectedHour}:${minute}` < minTime) ||
                    (maxTime && `${selectedHour}:${minute}` > maxTime);

                  return (
                    <button
                      key={minute}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleTimeSelect(selectedHour, minute)}
                      className={cn(
                        "w-full px-4 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground text-center transition-colors",
                        selectedMinute === minute &&
                          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-medium",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {minute}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 p-3 border-t bg-muted/50">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => {
              onTimeChange?.(undefined);
              setOpen(false);
            }}
          >
            Clear
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => setOpen(false)}
          >
            OK
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
