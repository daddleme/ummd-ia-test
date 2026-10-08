export function popupOffset(anchorLeft, popupWidth, viewportWidth) {
  const overflow = anchorLeft + popupWidth - viewportWidth;
  return overflow > 0 ? -overflow : 0;
}
