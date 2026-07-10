"use client";

type NotificationProviderProps = {
  children: React.ReactNode;
};

export default function NotificationProvider({
  children,
}: NotificationProviderProps) {
  return (
    <>
      {children}
    </>
  );
}