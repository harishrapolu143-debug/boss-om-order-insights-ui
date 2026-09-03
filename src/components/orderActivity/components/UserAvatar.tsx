import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar/avatar";
import { cn } from "./ui/utils";

interface UserAvatarProps {
  /** User's full name (e.g., "Alice Adams", "George Harris") */
  name: string;
  /** Optional profile picture URL */
  imageUrl?: string;
  /** Optional custom class name */
  className?: string;
  /** Size variant */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

/**
 * Get initials from a full name
 * @param name - Full name (e.g., "Alice Adams", "George Harris")
 * @returns Initials (e.g., "AA", "GH")
 */
const getInitials = (name: string): string => {
  if (!name || name.trim() === "") return "?";

  const parts = name.includes(",")
    ? name.split(",").map((t) => t.trim())
    : name.trim().split(/\s+/);

  if (parts.length === 1) {
    // Single name: take first two characters
    return parts[0].substring(0, 2).toUpperCase();
  }

  // Multiple names: take first letter of first and last name
  const firstInitial = parts[0][0];
  const lastInitial = parts[parts.length - 1][0];
  return `${firstInitial}${lastInitial}`.toUpperCase();
};

/**
 * Size mappings for different avatar sizes
 */
const sizeClasses = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-lg",
};

/**
 * UserAvatar Component
 *
 * Displays a user avatar with the following behavior:
 * - If imageUrl is provided and loads successfully: shows the profile picture
 * - If no imageUrl or image fails to load: shows initials in a colored circle
 * - Background color matches app's primary branding (indigo/blue)
 * - Initials are centered, bold, and easily readable
 * - Maintains consistent size and shape across all instances
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  imageUrl,
  className,
  size = "md",
}) => {
  const initials = getInitials(name);
  const sizeClass = sizeClasses[size];

  return (
    <Avatar className={cn(sizeClass, className)}>
      {imageUrl && <AvatarImage src={imageUrl} alt={`${name}'s avatar`} />}
      <AvatarFallback className="bg-[#ff0000] text-white font-bold flex items-center justify-center">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};
