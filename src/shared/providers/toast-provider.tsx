"use client";

import { ToastContainer, type ToastContainerProps } from "react-toastify";

type ToastProviderProps = {
  children: React.ReactNode;
};

const defaultToastOptions: ToastContainerProps = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  newestOnTop: true,
  closeOnClick: true,
  rtl: false,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
};

export default function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <ToastContainer {...defaultToastOptions} />
    </>
  );
}
