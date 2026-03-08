import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  SkipForward,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { type ChangeEvent, useRef } from "react";
import { useTranscript } from "../context/TranscriptContext";

export default function TranscriptPage() {
  const navigate = useNavigate();
  const { transcript, setTranscript } = useTranscript();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setTranscript(text ?? "");
    };
    reader.readAsText(file);
    // reset input so same file can be re-uploaded
    e.target.value = "";
  }

  return (
    <div className="min-h-screen mesh-bg" data-ocid="transcript.page">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-muted-foreground hover:text-foreground"
            onClick={() => navigate({ to: "/" })}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center">
              <FileText className="w-2.5 h-2.5 text-primary" />
            </div>
            <span className="font-display text-sm font-semibold text-foreground">
              Meeting Mind
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Step indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
              1
            </span>
            <span className="text-foreground font-medium">
              Paste Transcript
            </span>
            <span className="text-border">→</span>
            <span className="w-5 h-5 rounded-full bg-border text-muted-foreground flex items-center justify-center font-bold text-xs">
              2
            </span>
            <span>Fill Form</span>
          </div>

          {/* Title section */}
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground mb-1">
              Add Meeting Transcript
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Paste your meeting transcript below, or upload a .txt file. It
              will be available as reference while you fill in the structured
              form. This step is optional.
            </p>
          </div>

          {/* Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">
                Meeting Transcript
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.text"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5 border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40"
                onClick={() => fileInputRef.current?.click()}
                data-ocid="transcript.upload_button"
              >
                <Upload className="w-3 h-3" />
                Upload .txt
              </Button>
            </div>
            <Textarea
              data-ocid="transcript.textarea"
              placeholder="Paste your meeting transcript here...

Example:
[09:00] Sarah: Let's kick off the Q3 planning session.
[09:02] James: I think we should prioritize the new payment flow.
[09:05] Sarah: Agreed. Let's also discuss the hiring freeze..."
              className="min-h-[320px] resize-none bg-card border-border/60 text-sm font-mono leading-relaxed placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />
            {transcript && (
              <p className="text-xs text-muted-foreground">
                {transcript.length.toLocaleString()} characters ·{" "}
                {transcript.split("\n").length} lines
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate({ to: "/new/form" })}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-11"
              data-ocid="transcript.continue_button"
            >
              Continue to Form
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setTranscript("");
                navigate({ to: "/new/form" });
              }}
              className="w-full text-muted-foreground hover:text-foreground gap-2"
              data-ocid="transcript.skip_link"
            >
              <SkipForward className="w-4 h-4" />
              Skip — Fill Form Directly
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
