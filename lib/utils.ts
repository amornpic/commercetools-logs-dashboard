import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatJson(jsonString: any): string {
    try {
      if (typeof jsonString === "string") {
        // Check if input is a valid JSON string
        const parsedJson = JSON.parse(jsonString);
        return JSON.stringify(parsedJson, null, 2); // Format JSON
      } else if (typeof jsonString === "object" && jsonString !== null) {
        // Already a JSON object
        return JSON.stringify(jsonString, null, 2); // Format JSON
      } else {
        return String(jsonString); // Convert plain string or other types to string
      }
    } catch (error) {
      return jsonString; // Return original input if JSON parsing fails
    }
  }
