"use client";

type WebSocketProviderProps = {
  children: React.ReactNode;
};

export default function WebSocketProvider({
  children,
}: WebSocketProviderProps) {
  return (
    <>
      {children}
    </>
  );
}