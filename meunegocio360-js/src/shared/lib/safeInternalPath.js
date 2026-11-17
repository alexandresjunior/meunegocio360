export function safeInternalPath(from) {
  if (typeof from === "string") {
    return from.startsWith("/") &&
      !from.startsWith("//") &&
      !from.includes("\\") &&
      !/^\/login(?:[/?#]|$)/.test(from)
      ? from
      : "/";
  }

  const pathname = from?.pathname;
  if (
    typeof pathname !== "string" ||
    !pathname.startsWith("/") ||
    pathname.startsWith("//") ||
    pathname.includes("\\") ||
    /^\/login(?:\/|$)/.test(pathname)
  ) {
    return "/";
  }

  const search = typeof from.search === "string" ? from.search : "";
  const hash = typeof from.hash === "string" ? from.hash : "";
  return `${pathname}${search}${hash}`;
}
