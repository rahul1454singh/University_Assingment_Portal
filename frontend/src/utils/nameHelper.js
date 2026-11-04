/**
 * Extracts the primary initial letter for user avatars, ignoring honorific titles
 * such as Dr., Prof., Er., Mr., Mrs., Ms.
 * e.g. "Dr. Rahul" -> "R", "Dr Rahul Singh" -> "R", "Drew" -> "D"
 */
export const getAvatarInitial = (name, fallback = "U") => {
  if (!name || typeof name !== "string") return fallback;
  let trimmed = name.trim();
  while (/^(((dr|prof|er|mr|mrs|ms)\.)|(\b(dr|prof|er|mr|mrs|ms)\b\s+))\s*/i.test(trimmed)) {
    trimmed = trimmed.replace(/^(((dr|prof|er|mr|mrs|ms)\.)|(\b(dr|prof|er|mr|mrs|ms)\b\s+))\s*/i, "").trim();
  }
  const effectiveName = trimmed || name.trim();
  return (effectiveName.charAt(0) || fallback).toUpperCase();
};

/**
 * Formats a professor's name appropriately for display.
 * Avoids duplicating titles like "Prof. Dr. Rahul" -> ensures it displays as "Dr. Rahul".
 * If no title is present (e.g. "Rahul"), formats as "Prof. Rahul".
 */
export const formatProfessorName = (name) => {
  if (!name || typeof name !== "string") return "Professor";
  const trimmed = name.trim();
  // If accidentally prefixed with Prof. Dr., clean to Dr.
  if (/^prof\.?\s*(dr\.?)/i.test(trimmed)) {
    return trimmed.replace(/^prof\.?\s*/i, "");
  }
  // If already starts with Dr. / Dr / Prof. / Prof or Er., use as is
  if (/^(((dr|prof|er)\.)|(\b(dr|prof|er)\b\s+))/i.test(trimmed)) {
    return trimmed;
  }
  // If no prefix, add Prof.
  return `Prof. ${trimmed}`;
};

/**
 * Returns a friendly greeting name for navbars.
 * e.g. "Dr. Rahul" -> "Dr. Rahul" (instead of just "Dr."), "Rahul Singh" -> "Rahul"
 */
export const getGreetingName = (name) => {
  if (!name || typeof name !== "string") return "User";
  const trimmed = name.trim();
  const parts = trimmed.split(/\s+/);
  if (/^((dr|prof|er|mr|mrs|ms)\.?)$/i.test(parts[0]) && parts.length > 1) {
    return `${parts[0]} ${parts[1]}`;
  }
  return parts[0] || "User";
};
