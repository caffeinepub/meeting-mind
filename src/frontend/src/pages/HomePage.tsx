import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { BookOpen, Calendar, Clock, FileText, Plus, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { MeetingRecord } from "../backend.d";
import { useMeetingRecords } from "../hooks/useQueries";

function formatDate(dateStr: string): string {
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

function RecordCard({
  record,
  index,
}: {
  record: MeetingRecord;
  index: number;
}) {
  const navigate = useNavigate();
  const snippet =
    record.executiveSummary?.slice(0, 120) +
    (record.executiveSummary?.length > 120 ? "…" : "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      data-ocid={`home.item.${index + 1}`}
    >
      <Card
        className="group cursor-pointer border-border/60 bg-card hover:bg-card/80 hover:border-primary/30 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5"
        onClick={() =>
          navigate({ to: "/record/$id", params: { id: record.id.toString() } })
        }
      >
        <CardContent className="p-4 space-y-3">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-base text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {record.title}
              </h3>
            </div>
            <FileText className="shrink-0 w-4 h-4 text-muted-foreground mt-0.5 group-hover:text-primary/60 transition-colors" />
          </div>

          {/* Snippet */}
          {snippet && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {snippet}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(record.date)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {record.participants.length}{" "}
              {record.participants.length === 1 ? "person" : "people"}
            </span>
            {record.actionItems.length > 0 && (
              <Badge
                variant="secondary"
                className="text-xs px-1.5 py-0 bg-accent text-accent-foreground border-0"
              >
                {record.actionItems.length} actions
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EmptyState() {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      data-ocid="home.empty_state"
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-5">
        <BookOpen className="w-7 h-7 text-accent-foreground" />
      </div>
      <h2 className="font-display text-xl font-semibold text-foreground mb-2">
        No records yet
      </h2>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">
        Create your first meeting minute record to start tracking decisions,
        action items, and key discussions.
      </p>
      <Button
        onClick={() => navigate({ to: "/new/transcript" })}
        className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
      >
        <Plus className="w-4 h-4" />
        Create First Record
      </Button>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-border/60 bg-card">
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-5 w-3/4 bg-secondary" />
            <Skeleton className="h-4 w-full bg-secondary" />
            <Skeleton className="h-4 w-2/3 bg-secondary" />
            <div className="flex gap-3">
              <Skeleton className="h-3 w-20 bg-secondary" />
              <Skeleton className="h-3 w-16 bg-secondary" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { data: records = [], isLoading } = useMeetingRecords();

  const sorted = [...records].sort(
    (a, b) => Number(b.createdTimestamp) - Number(a.createdTimestamp),
  );

  return (
    <div className="min-h-screen mesh-bg" data-ocid="home.page">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-base font-semibold text-foreground leading-none">
                Meeting Mind
              </h1>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => navigate({ to: "/new/transcript" })}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 h-8 text-sm"
            data-ocid="home.new_record_button"
          >
            <Plus className="w-3.5 h-3.5" />
            New Record
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Page title + count */}
        <div className="mb-5 flex items-baseline justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Meeting Records
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your structured meeting minute archive
            </p>
          </div>
          {records.length > 0 && (
            <span className="text-xs text-muted-foreground font-medium bg-secondary px-2 py-0.5 rounded-full">
              {records.length} {records.length === 1 ? "record" : "records"}
            </span>
          )}
        </div>

        {/* Record list */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              data-ocid="home.loading_state"
            >
              <LoadingSkeleton />
            </motion.div>
          ) : sorted.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <EmptyState />
            </motion.div>
          ) : (
            <motion.div key="list" className="space-y-3" data-ocid="home.list">
              {sorted.map((record, i) => (
                <RecordCard
                  key={record.id.toString()}
                  record={record}
                  index={i}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 px-4">
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
