export function subscribeToNetwork(cb: (online: boolean) => void) {
  const onOnline = () => cb(true);
  const onOffline = () => cb(false);

  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);

  return () => {
    window.removeEventListener("online", onOnline);
    window.removeEventListener("offline", onOffline);
  };
}
