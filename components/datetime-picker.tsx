"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Label } from "./ui/label";

interface IDateTimePicker {
    label?: string | undefined
    dateData: Date | undefined
    onChange: (date: Date) => void
}

export function DateTimePicker({dateData, onChange, label}: IDateTimePicker) {
  const [date, setDate] = React.useState<Date | undefined>();
  const [hour, setHour] = React.useState<number>(0);
  const [minute, setMinute] = React.useState<number>(0);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (dateData) {
      setDate(dateData);
    }
  }, [dateData])

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
        let newDate = new Date(selectedDate);
        if (hour) {
            newDate.setHours(hour);
        }
        if (minute) {
            newDate.setMinutes(minute);
        }

        setDate(newDate);
        onChange(newDate)
    }
  };

  const handleTimeChange = (
    type: "hour" | "minute",
    value: string
  ) => {
    if (date) {
      const newDate = new Date(date);
      if (type === "hour") {
        setHour(parseInt(value))
        newDate.setHours(parseInt(value));
      } else if (type === "minute") {
        setMinute(parseInt(value))
        newDate.setMinutes(parseInt(value));
      }
      
      setDate(newDate);
      onChange(newDate)
    }
  };

  return (
    <div className="flex flex-col gap-2">
        {label && <Label className="px-1">{label}</Label>}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                    >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                        `${format(date, "dd/MM/yyyy")} ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })}`
                    ) : (
                        <span>DD/MM/YYYY hh:mm</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <div className="sm:flex">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                    />
                    <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                        <ScrollArea className="w-64 sm:w-auto">
                        <div className="flex sm:flex-col p-2">
                            {hours.reverse().map((hour) => (
                            <Button
                                key={hour}
                                size="icon"
                                variant={date && date.getHours() === hour ? "default" : "ghost"}
                                className="sm:w-full shrink-0 aspect-square"
                                onClick={() => handleTimeChange("hour", hour.toString())}
                            >
                                {hour}
                            </Button>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" className="sm:hidden" />
                        </ScrollArea>
                        <ScrollArea className="w-64 sm:w-auto">
                        <div className="flex sm:flex-col p-2">
                            {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                            <Button
                                key={minute}
                                size="icon"
                                variant={date && date.getMinutes() === minute ? "default" : "ghost"}
                                className="sm:w-full shrink-0 aspect-square"
                                onClick={() => handleTimeChange("minute", minute.toString())}
                            >
                                {minute.toString().padStart(2, '0')}
                            </Button>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" className="sm:hidden" />
                        </ScrollArea>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    </div>
  );
}
