"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { addDays, format } from "date-fns"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateRangePickerProps {
  onChange?: (range: { from?: Date; to?: Date }) => void
}

export function DateRangePicker({ onChange }: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(new Date().setHours(0, 0, 0, 0)),
    to: addDays(new Date(new Date().setHours(23, 59, 59, 999)), 0),
  })

  const [selectedPreset, setSelectedPreset] = React.useState<string>("today")

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset)

    const now = new Date()
    const startOfDay = new Date(now.setHours(0, 0, 0, 0))
    let newRange: DateRange | undefined

    switch (preset) {
      case "today":
        newRange = {
          from: startOfDay,
          to: new Date(new Date().setHours(23, 59, 59, 999)),
        }
        break
      case "yesterday":
        const yesterday = addDays(startOfDay, -1)
        newRange = {
          from: yesterday,
          to: new Date(new Date(yesterday).setHours(23, 59, 59, 999)),
        }
        break
      case "7days":
        newRange = {
          from: addDays(startOfDay, -6),
          to: new Date(new Date().setHours(23, 59, 59, 999)),
        }
        break
      case "30days":
        newRange = {
          from: addDays(startOfDay, -29),
          to: new Date(new Date().setHours(23, 59, 59, 999)),
        }
        break
      case "custom":
        // Keep the current date range
        newRange = date
        break
    }

    setDate(newRange)
    if (onChange && newRange) {
      onChange(newRange)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Select value={selectedPreset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="yesterday">Yesterday</SelectItem>
          <SelectItem value="7days">Last 7 days</SelectItem>
          <SelectItem value="30days">Last 30 days</SelectItem>
          <SelectItem value="custom">Custom range</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-full sm:w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(newDate) => {
              setDate(newDate)
              if (newDate?.from && newDate?.to && selectedPreset !== "custom") {
                setSelectedPreset("custom")
              }
              if (onChange && newDate) {
                onChange(newDate)
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

