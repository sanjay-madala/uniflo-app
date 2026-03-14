"use client";

interface GoalOwnerAvatarProps {
  name: string;
  avatar?: string | null;
  showName?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function GoalOwnerAvatar({
  name,
  avatar,
  showName = true,
  size = "sm",
  className = "",
}: GoalOwnerAvatarProps) {
  const sizeClass = size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className={`${sizeClass} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizeClass} rounded-full bg-[var(--accent-blue)]/20 text-[var(--accent-blue)] flex items-center justify-center font-medium shrink-0`}
        >
          {initials}
        </div>
      )}
      {showName && (
        <span className="text-sm text-[var(--text-secondary)] truncate">{name}</span>
      )}
    </div>
  );
}
