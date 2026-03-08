import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
  Clock,
  FileText,
  Loader2,
  MessageSquare,
  ParkingSquare,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useDeleteMeetingRecord, useMeetingRecord } from "../hooks/useQueries";

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatDeadline(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <h2 className="font-display text-base font-semibold text-foreground">
        {title}
      </h2>
    </div>
  );
}

export default function RecordDetailPage() {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params = useParams({ strict: false }) as any;
  const recordId = params?.id ? BigInt(params.id) : null;

  const { data: record, isLoading } = useMeetingRecord(recordId);
  const deleteMutation = useDeleteMeetingRecord();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  // ── Copy to clipboard ────────────────────────────────────
  function handleCopy() {
    if (!record) return;

    const lines: string[] = [];
    lines.push(`# ${record.title}`);
    lines.push(`Date: ${formatDate(record.date)}`);
    if (record.participants.length > 0) {
      lines.push(`Participants: ${record.participants.join(", ")}`);
    }
    lines.push("");

    if (record.executiveSummary) {
      lines.push("## Executive Summary");
      lines.push(record.executiveSummary);
      lines.push("");
    }

    if (record.decisions.length > 0) {
      lines.push("## Key Decisions Made");
      for (const d of record.decisions) lines.push(`• ${d}`);
      lines.push("");
    }

    if (record.actionItems.length > 0) {
      lines.push("## Action Item Tracker");
      lines.push("Task | Owner | Deadline");
      lines.push("-----|-------|--------");
      for (const a of record.actionItems) {
        lines.push(
          `${a.task} | **${a.owner}** | **${formatDeadline(a.deadline)}**`,
        );
      }
      lines.push("");
    }

    if (record.discussionTopics.length > 0) {
      lines.push("## Discussion Deep-Dive");
      for (const t of record.discussionTopics) {
        lines.push(`### ${t.category}`);
        if (t.perspectives) lines.push(`Perspectives: ${t.perspectives}`);
        if (t.consensus) lines.push(`Consensus: ${t.consensus}`);
        lines.push("");
      }
    }

    if (record.parkingLotItems.length > 0) {
      lines.push("## Parking Lot / Next Steps");
      for (const p of record.parkingLotItems) lines.push(`• ${p}`);
      lines.push("");
    }

    navigator.clipboard
      .writeText(lines.join("\n"))
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy"));
  }

  // ── Delete ────────────────────────────────────────────────
  async function handleDelete() {
    if (!recordId) return;
    try {
      await deleteMutation.mutateAsync(recordId);
      toast.success("Record deleted");
      navigate({ to: "/" });
    } catch {
      toast.error("Failed to delete record");
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen mesh-bg" data-ocid="detail.loading_state">
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/40">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-secondary animate-pulse" />
            <div className="h-4 w-32 rounded bg-secondary animate-pulse" />
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-card rounded-xl border border-border/60 p-4 space-y-3"
            >
              <Skeleton className="h-5 w-1/3 bg-secondary" />
              <Skeleton className="h-4 w-full bg-secondary" />
              <Skeleton className="h-4 w-3/4 bg-secondary" />
            </div>
          ))}
        </main>
      </div>
    );
  }

  if (!record) {
    return (
      <div
        className="min-h-screen mesh-bg flex flex-col items-center justify-center gap-4"
        data-ocid="detail.error_state"
      >
        <p className="text-muted-foreground text-sm">Record not found.</p>
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/" })}
          className="gap-2"
          data-ocid="detail.back_button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Records
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-bg pb-16" data-ocid="detail.page">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-muted-foreground hover:text-foreground"
              onClick={() => navigate({ to: "/" })}
              data-ocid="detail.back_button"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center">
                <FileText className="w-2.5 h-2.5 text-primary" />
              </div>
              <span className="font-display text-sm font-semibold text-foreground line-clamp-1">
                {record.title}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
              title="Copy to clipboard"
              data-ocid="detail.copy_button"
            >
              <ClipboardCopy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-muted-foreground hover:text-foreground"
              onClick={() =>
                navigate({
                  to: "/edit/$id",
                  params: { id: record.id.toString() },
                })
              }
              title="Edit record"
              data-ocid="detail.edit_button"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => setDeleteOpen(true)}
              title="Delete record"
              data-ocid="detail.delete_button"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* ── Record header card ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-card rounded-xl border border-border/60 p-5 space-y-4"
        >
          <div>
            <h1 className="font-display text-xl font-semibold text-foreground leading-snug mb-2">
              {record.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary/60" />
                {formatDate(record.date)}
              </span>
              {record.participants.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary/60" />
                  {record.participants.length}{" "}
                  {record.participants.length === 1
                    ? "participant"
                    : "participants"}
                </span>
              )}
            </div>
          </div>

          {/* Participants */}
          {record.participants.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {record.participants.map((p) => (
                <span key={p} className="tag-chip">
                  {p}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Executive Summary ── */}
        {record.executiveSummary && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.06 }}
            className="bg-card rounded-xl border border-border/60 p-5 print-section"
          >
            <SectionTitle icon={Clock} title="Executive Summary" />
            <p className="text-sm text-foreground/90 leading-relaxed">
              {record.executiveSummary}
            </p>
          </motion.div>
        )}

        {/* ── Key Decisions ── */}
        {record.decisions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12 }}
            className="bg-card rounded-xl border border-border/60 p-5 print-section"
          >
            <SectionTitle icon={CheckSquare} title="Key Decisions Made" />
            <ul className="space-y-2">
              {record.decisions.map((d) => (
                <li key={d} className="flex items-start gap-2.5 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span className="text-foreground/90 leading-relaxed">
                    {d}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* ── Action Items ── */}
        {record.actionItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.18 }}
            className="bg-card rounded-xl border border-border/60 p-5 print-section overflow-x-auto"
          >
            <SectionTitle icon={CheckSquare} title="Action Item Tracker" />
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="text-left py-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Task
                    </th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                      Owner
                    </th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                      Deadline
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {record.actionItems.map((item) => (
                    <tr
                      key={item.task}
                      className="border-b border-border/30 last:border-0"
                    >
                      <td className="py-2.5 px-2 text-foreground/90 leading-snug">
                        {item.task}
                      </td>
                      <td className="py-2.5 px-2 whitespace-nowrap">
                        <span className="font-semibold text-foreground">
                          {item.owner || "—"}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 whitespace-nowrap">
                        {item.deadline ? (
                          <Badge className="text-xs bg-primary/15 text-primary border-primary/20 font-semibold">
                            {formatDeadline(item.deadline)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ── Discussion Deep-Dive ── */}
        {record.discussionTopics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.24 }}
            className="bg-card rounded-xl border border-border/60 p-5 print-section"
          >
            <SectionTitle icon={MessageSquare} title="Discussion Deep-Dive" />
            <div className="space-y-3">
              {record.discussionTopics.map((topic, i) => (
                <div
                  key={topic.category || `topic-${i}`}
                  className="rounded-lg border border-border/40 bg-background/30 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-border/30 bg-background/40">
                    <h3 className="font-display text-sm font-semibold text-foreground">
                      {topic.category || `Topic ${i + 1}`}
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {topic.perspectives && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                          Perspectives
                        </p>
                        <p className="text-sm text-foreground/85 leading-relaxed">
                          {topic.perspectives}
                        </p>
                      </div>
                    )}
                    {topic.consensus && (
                      <div>
                        <p className="text-xs font-semibold text-primary/80 uppercase tracking-wide mb-1">
                          Consensus
                        </p>
                        <p className="text-sm text-foreground/85 leading-relaxed">
                          {topic.consensus}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Parking Lot ── */}
        {record.parkingLotItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.3 }}
            className="bg-card rounded-xl border border-border/60 p-5 print-section"
          >
            <SectionTitle
              icon={ParkingSquare}
              title="Parking Lot / Next Steps"
            />
            <ul className="space-y-2">
              {record.parkingLotItems.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                  <span className="text-foreground/85 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* ── Original Transcript (collapsible) ── */}
        {record.transcript && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.36 }}
          >
            <Collapsible open={transcriptOpen} onOpenChange={setTranscriptOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-card border border-border/60 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Original Transcript
                    </span>
                  </div>
                  {transcriptOpen ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-1 px-4 py-3 bg-card/60 rounded-b-xl border border-t-0 border-border/40">
                  <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed">
                    {record.transcript}
                  </pre>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </motion.div>
        )}

        {/* ── Bottom action buttons ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="flex gap-3 no-print"
        >
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/" })}
            className="gap-2 border-border/60 text-muted-foreground hover:text-foreground"
            data-ocid="detail.back_button"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              navigate({
                to: "/edit/$id",
                params: { id: record.id.toString() },
              })
            }
            className="gap-2 border-border/60 text-muted-foreground hover:text-foreground"
            data-ocid="detail.edit_button"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleCopy}
            className="gap-2 border-border/60 text-muted-foreground hover:text-foreground"
            data-ocid="detail.copy_button"
          >
            <ClipboardCopy className="w-4 h-4" />
            Copy
          </Button>
          <Button
            variant="outline"
            onClick={() => setDeleteOpen(true)}
            className="gap-2 border-border/60 text-muted-foreground hover:text-destructive hover:border-destructive/30"
            data-ocid="detail.delete_button"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </motion.div>
      </main>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent
          className="bg-card border-border max-w-sm"
          data-ocid="detail.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              Delete Meeting Record
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                "{record.title}"
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 flex-row">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="flex-1 border-border/60 text-muted-foreground hover:text-foreground"
              data-ocid="detail.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex-1"
              data-ocid="detail.confirm_button"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="text-center py-8 px-4 no-print">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with{" "}
          <span className="text-primary">♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
