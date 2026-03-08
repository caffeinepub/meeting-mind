import { type ReactNode, createContext, useContext, useState } from "react";

interface TranscriptContextValue {
  transcript: string;
  setTranscript: (t: string) => void;
}

const TranscriptContext = createContext<TranscriptContextValue>({
  transcript: "",
  setTranscript: () => {},
});

export function TranscriptProvider({ children }: { children: ReactNode }) {
  const [transcript, setTranscript] = useState("");
  return (
    <TranscriptContext.Provider value={{ transcript, setTranscript }}>
      {children}
    </TranscriptContext.Provider>
  );
}

export function useTranscript() {
  return useContext(TranscriptContext);
}
