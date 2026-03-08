import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Minus,
  Plus,
  Save,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { useTranscript } from "../context/TranscriptContext";
import {
  useCreateMeetingRecord,
  useMeetingRecord,
  useUpdateMeetingRecord,
} from "../hooks/useQueries";

// ── Helper types ─────────────────────────────────────────
let _uid = 0;
function uid() {
  return `id-${++_uid}`;
}

interface DecisionItem {
  id: string;
  value: string;
}
interface ActionItemRow {
  id: string;
  task: string;
  owner: string;
  deadline: string;
}
interface TopicItem {
  id: string;
  category: string;
  perspectives: string;
  consensus: string;
}
interface ParkingItem {
  id: string;
  value: string;
}

interface FormState {
  title: string;
  date: string;
  participants: string[];
  executiveSummary: string;
  decisions: DecisionItem[];
  actionItems: ActionItemRow[];
  discussionTopics: TopicItem[];
  parkingLotItems: ParkingItem[];
}

const defaultForm = (): FormState => ({
  title: "",
  date: new Date().toISOString().split("T")[0],
  participants: [],
  executiveSummary: "",
  decisions: [{ id: uid(), value: "" }],
  actionItems: [{ id: uid(), task: "", owner: "", deadline: "" }],
  discussionTopics: [
    { id: uid(), category: "", perspectives: "", consensus: "" },
  ],
  parkingLotItems: [{ id: uid(), value: "" }],
});

// ── Participant tag input ─────────────────────────────────
function ParticipantInput({
  participants,
  onChange,
}: {
  participants: string[];
  onChange: (p: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(val: string) {
    const trimmed = val.trim();
    if (trimmed && !participants.includes(trimmed)) {
      onChange([...participants, trimmed]);
    }
    setInput("");
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (
      e.key === "Backspace" &&
      input === "" &&
      participants.length > 0
    ) {
      onChange(participants.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    onChange(participants.filter((p) => p !== tag));
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: clicking the tag container focuses the inner input
    <div
      className="min-h-[42px] flex flex-wrap gap-1.5 items-center px-3 py-2 rounded-md border border-border/60 bg-input cursor-text focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20"
      onClick={() => inputRef.current?.focus()}
    >
      {participants.map((p) => (
        <span key={p} className="tag-chip">
          {p}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(p);
            }}
            className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        data-ocid="form.participants_input"
        value={input}
        onChange={(e) => {
          const v = e.target.value;
          if (v.endsWith(",")) {
            addTag(v.slice(0, -1));
          } else {
            setInput(v);
          }
        }}
        onKeyDown={handleKey}
        onBlur={() => {
          if (input.trim()) addTag(input);
        }}
        placeholder={
          participants.length === 0
            ? "Type name, press Enter or comma…"
            : "Add more…"
        }
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/50"
      />
    </div>
  );
}

// ── Section header ────────────────────────────────────────
function SectionHeader({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <span className="w-6 h-6 shrink-0 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary mt-0.5">
        {number}
      </span>
      <div>
        <h2 className="font-display text-base font-semibold text-foreground leading-snug">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────
export default function RecordFormPage() {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params = useParams({ strict: false }) as any;
  const editId = params?.id ? BigInt(params.id) : null;
  const isEdit = editId !== null;

  const { transcript, setTranscript } = useTranscript();
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm());

  const { data: existingRecord, isLoading: loadingRecord } =
    useMeetingRecord(editId);
  const createMutation = useCreateMeetingRecord();
  const updateMutation = useUpdateMeetingRecord();

  // Populate form when editing
  useEffect(() => {
    if (existingRecord && isEdit) {
      setForm({
        title: existingRecord.title,
        date: existingRecord.date,
        participants: existingRecord.participants,
        executiveSummary: existingRecord.executiveSummary,
        decisions:
          existingRecord.decisions.length > 0
            ? existingRecord.decisions.map((v) => ({ id: uid(), value: v }))
            : [{ id: uid(), value: "" }],
        actionItems:
          existingRecord.actionItems.length > 0
            ? existingRecord.actionItems.map((a) => ({ id: uid(), ...a }))
            : [{ id: uid(), task: "", owner: "", deadline: "" }],
        discussionTopics:
          existingRecord.discussionTopics.length > 0
            ? existingRecord.discussionTopics.map((t) => ({ id: uid(), ...t }))
            : [{ id: uid(), category: "", perspectives: "", consensus: "" }],
        parkingLotItems:
          existingRecord.parkingLotItems.length > 0
            ? existingRecord.parkingLotItems.map((v) => ({
                id: uid(),
                value: v,
              }))
            : [{ id: uid(), value: "" }],
      });
      if (existingRecord.transcript) {
        setTranscript(existingRecord.transcript);
      }
    }
  }, [existingRecord, isEdit, setTranscript]);

  // ── Helpers ──────────────────────────────────────────────
  function updateDecision(id: string, val: string) {
    setForm((prev) => ({
      ...prev,
      decisions: prev.decisions.map((d) =>
        d.id === id ? { ...d, value: val } : d,
      ),
    }));
  }

  function addDecision() {
    setForm((prev) => ({
      ...prev,
      decisions: [...prev.decisions, { id: uid(), value: "" }],
    }));
  }

  function removeDecision(id: string) {
    setForm((prev) => ({
      ...prev,
      decisions: prev.decisions.filter((d) => d.id !== id),
    }));
  }

  function updateActionItem(
    id: string,
    field: "task" | "owner" | "deadline",
    val: string,
  ) {
    setForm((prev) => ({
      ...prev,
      actionItems: prev.actionItems.map((a) =>
        a.id === id ? { ...a, [field]: val } : a,
      ),
    }));
  }

  function addActionItem() {
    setForm((prev) => ({
      ...prev,
      actionItems: [
        ...prev.actionItems,
        { id: uid(), task: "", owner: "", deadline: "" },
      ],
    }));
  }

  function removeActionItem(id: string) {
    setForm((prev) => ({
      ...prev,
      actionItems: prev.actionItems.filter((a) => a.id !== id),
    }));
  }

  function updateTopic(
    id: string,
    field: "category" | "perspectives" | "consensus",
    val: string,
  ) {
    setForm((prev) => ({
      ...prev,
      discussionTopics: prev.discussionTopics.map((t) =>
        t.id === id ? { ...t, [field]: val } : t,
      ),
    }));
  }

  function addTopic() {
    setForm((prev) => ({
      ...prev,
      discussionTopics: [
        ...prev.discussionTopics,
        { id: uid(), category: "", perspectives: "", consensus: "" },
      ],
    }));
  }

  function removeTopic(id: string) {
    setForm((prev) => ({
      ...prev,
      discussionTopics: prev.discussionTopics.filter((t) => t.id !== id),
    }));
  }

  function updateParkingItem(id: string, val: string) {
    setForm((prev) => ({
      ...prev,
      parkingLotItems: prev.parkingLotItems.map((p) =>
        p.id === id ? { ...p, value: val } : p,
      ),
    }));
  }

  function addParkingItem() {
    setForm((prev) => ({
      ...prev,
      parkingLotItems: [...prev.parkingLotItems, { id: uid(), value: "" }],
    }));
  }

  function removeParkingItem(id: string) {
    setForm((prev) => ({
      ...prev,
      parkingLotItems: prev.parkingLotItems.filter((p) => p.id !== id),
    }));
  }

  // ── Submit ──────────────────────────────────────────────
  async function handleSave() {
    if (!form.title.trim()) {
      toast.error("Meeting title is required");
      return;
    }

    const payload = {
      title: form.title.trim(),
      date: form.date,
      participants: form.participants.filter(Boolean),
      executiveSummary: form.executiveSummary.trim(),
      decisions: form.decisions.map((d) => d.value).filter((v) => v.trim()),
      actionItems: form.actionItems
        .filter((a) => a.task.trim())
        .map(({ task, owner, deadline }) => ({ task, owner, deadline })),
      discussionTopics: form.discussionTopics
        .filter((t) => t.category.trim())
        .map(({ category, perspectives, consensus }) => ({
          category,
          perspectives,
          consensus,
        })),
      parkingLotItems: form.parkingLotItems
        .map((p) => p.value)
        .filter((v) => v.trim()),
      transcript: transcript.trim() || null,
    };

    try {
      if (isEdit && editId !== null) {
        await updateMutation.mutateAsync({ id: editId, ...payload });
        toast.success("Record updated");
        navigate({
          to: "/record/$id",
          params: { id: editId.toString() },
        });
      } else {
        const newId = await createMutation.mutateAsync(payload);
        setTranscript("");
        toast.success("Record created");
        navigate({
          to: "/record/$id",
          params: { id: newId.toString() },
        });
      }
    } catch {
      toast.error("Failed to save record. Please try again.");
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isError = createMutation.isError || updateMutation.isError;

  if (isEdit && loadingRecord) {
    return (
      <div
        className="min-h-screen mesh-bg flex items-center justify-center"
        data-ocid="form.loading_state"
      >
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-bg pb-16" data-ocid="form.page">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-muted-foreground hover:text-foreground"
              onClick={() => {
                if (isEdit && editId !== null) {
                  navigate({
                    to: "/record/$id",
                    params: { id: editId.toString() },
                  });
                } else {
                  navigate({ to: "/" });
                }
              }}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center">
                <FileText className="w-2.5 h-2.5 text-primary" />
              </div>
              <span className="font-display text-sm font-semibold text-foreground">
                {isEdit ? "Edit Record" : "New Record"}
              </span>
            </div>
          </div>
          {/* Step indicator for new records */}
          {!isEdit && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-5 h-5 rounded-full bg-border text-muted-foreground flex items-center justify-center font-bold text-xs">
                1
              </span>
              <span className="text-border">→</span>
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                2
              </span>
              <span className="text-foreground font-medium">Fill Form</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Transcript reference panel */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Collapsible open={transcriptOpen} onOpenChange={setTranscriptOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-card border border-border/60 hover:border-primary/30 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-primary/70" />
                    <span className="text-sm font-medium text-foreground">
                      Transcript Reference
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({transcript.length.toLocaleString()} chars)
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
                <div className="mt-1 px-4 py-3 rounded-lg bg-card/50 border border-border/40 border-t-0 rounded-t-none">
                  <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                    {transcript}
                  </pre>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </motion.div>
        )}

        {/* ── Section 1: Meeting Info ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="bg-card rounded-xl border border-border/60 p-4 space-y-4"
        >
          <SectionHeader number="1" title="Meeting Information" />

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Meeting Title <span className="text-destructive">*</span>
            </Label>
            <Input
              data-ocid="form.title_input"
              placeholder="e.g. Q3 Product Planning Session"
              value={form.title}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              className="bg-input border-border/60 focus:border-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Date
            </Label>
            <Input
              data-ocid="form.date_input"
              type="date"
              value={form.date}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm((p) => ({ ...p, date: e.target.value }))
              }
              className="bg-input border-border/60 focus:border-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Participants
            </Label>
            <ParticipantInput
              participants={form.participants}
              onChange={(p) =>
                setForm((prev) => ({ ...prev, participants: p }))
              }
            />
          </div>
        </motion.div>

        {/* ── Section 2: Executive Summary ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="bg-card rounded-xl border border-border/60 p-4 space-y-4"
        >
          <SectionHeader
            number="2"
            title="Executive Summary"
            description="A 3-sentence overview of the meeting's purpose and tone"
          />
          <Textarea
            data-ocid="form.summary_textarea"
            placeholder="Write a 3-sentence overview of the meeting's purpose and tone…"
            className="min-h-[100px] resize-none bg-input border-border/60 focus:border-primary/50 text-sm"
            value={form.executiveSummary}
            onChange={(e) =>
              setForm((p) => ({ ...p, executiveSummary: e.target.value }))
            }
          />
        </motion.div>

        {/* ── Section 3: Key Decisions ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="bg-card rounded-xl border border-border/60 p-4 space-y-4"
        >
          <SectionHeader
            number="3"
            title="Key Decisions Made"
            description="Finalized decisions from the meeting"
          />
          <div className="space-y-2" data-ocid="form.decisions_list">
            {form.decisions.map((d, i) => (
              <div key={d.id} className="flex gap-2 items-center">
                <span className="w-5 h-5 shrink-0 rounded-full bg-secondary text-muted-foreground flex items-center justify-center text-xs font-medium">
                  {i + 1}
                </span>
                <Input
                  data-ocid={`form.decision_input.${i + 1}`}
                  placeholder={`Decision ${i + 1}…`}
                  value={d.value}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateDecision(d.id, e.target.value)
                  }
                  className="flex-1 bg-input border-border/60 focus:border-primary/50 text-sm"
                />
                {form.decisions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeDecision(d.id)}
                    data-ocid={`form.delete_button.${i + 1}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs border-dashed border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40"
            onClick={addDecision}
            data-ocid="form.add_decision_button"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Decision
          </Button>
        </motion.div>

        {/* ── Section 4: Action Item Tracker ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="bg-card rounded-xl border border-border/60 p-4 space-y-4"
        >
          <SectionHeader
            number="4"
            title="Action Item Tracker"
            description="Tasks, owners, and deadlines"
          />

          <div className="space-y-3" data-ocid="form.actions_table">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_120px_120px_32px] gap-2 px-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Task
              </span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Owner
              </span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Deadline
              </span>
              <span />
            </div>

            {form.actionItems.map((item, i) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_120px_120px_32px] gap-2 items-center"
              >
                <Input
                  data-ocid={`form.action_task_input.${i + 1}`}
                  placeholder="Task description…"
                  value={item.task}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateActionItem(item.id, "task", e.target.value)
                  }
                  className="bg-input border-border/60 focus:border-primary/50 text-sm h-9"
                />
                <Input
                  data-ocid={`form.action_owner_input.${i + 1}`}
                  placeholder="Name…"
                  value={item.owner}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateActionItem(item.id, "owner", e.target.value)
                  }
                  className="bg-input border-border/60 focus:border-primary/50 text-sm h-9"
                />
                <Input
                  data-ocid={`form.action_deadline_input.${i + 1}`}
                  type="date"
                  value={item.deadline}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateActionItem(item.id, "deadline", e.target.value)
                  }
                  className="bg-input border-border/60 focus:border-primary/50 text-sm h-9"
                />
                {form.actionItems.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeActionItem(item.id)}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </Button>
                ) : (
                  <div className="w-7" />
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs border-dashed border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40"
            onClick={addActionItem}
            data-ocid="form.add_action_button"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Action Item
          </Button>
        </motion.div>

        {/* ── Section 5: Discussion Deep-Dive ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="bg-card rounded-xl border border-border/60 p-4 space-y-4"
        >
          <SectionHeader
            number="5"
            title="Discussion Deep-Dive"
            description="3–4 topic categories with perspectives and consensus"
          />

          <div className="space-y-4" data-ocid="form.topics_list">
            {form.discussionTopics.map((topic, i) => (
              <div
                key={topic.id}
                className="rounded-lg border border-border/40 bg-background/40 p-3 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                    Topic {i + 1}
                  </span>
                  {form.discussionTopics.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeTopic(topic.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                <Input
                  data-ocid={`form.topic_category_input.${i + 1}`}
                  placeholder="Category name (e.g. Budget Allocation)…"
                  value={topic.category}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateTopic(topic.id, "category", e.target.value)
                  }
                  className="bg-input border-border/60 focus:border-primary/50 text-sm"
                />
                <Textarea
                  data-ocid={`form.topic_perspectives_textarea.${i + 1}`}
                  placeholder="Different perspectives shared…"
                  value={topic.perspectives}
                  onChange={(e) =>
                    updateTopic(topic.id, "perspectives", e.target.value)
                  }
                  className="min-h-[72px] resize-none bg-input border-border/60 focus:border-primary/50 text-sm"
                />
                <Textarea
                  data-ocid={`form.topic_consensus_textarea.${i + 1}`}
                  placeholder="Final consensus reached…"
                  value={topic.consensus}
                  onChange={(e) =>
                    updateTopic(topic.id, "consensus", e.target.value)
                  }
                  className="min-h-[72px] resize-none bg-input border-border/60 focus:border-primary/50 text-sm"
                />
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs border-dashed border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40"
            onClick={addTopic}
            data-ocid="form.add_topic_button"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Topic
          </Button>
        </motion.div>

        {/* ── Section 6: Parking Lot ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
          className="bg-card rounded-xl border border-border/60 p-4 space-y-4"
        >
          <SectionHeader
            number="6"
            title="Parking Lot / Next Steps"
            description="Deferred topics and items requiring follow-up"
          />

          <div className="space-y-2" data-ocid="form.parking_list">
            {form.parkingLotItems.map((item, i) => (
              <div key={item.id} className="flex gap-2 items-center">
                <span className="w-4 h-4 shrink-0 text-muted-foreground/50 text-xs flex items-center">
                  •
                </span>
                <Input
                  data-ocid={`form.parking_input.${i + 1}`}
                  placeholder={`Item ${i + 1}…`}
                  value={item.value}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateParkingItem(item.id, e.target.value)
                  }
                  className="flex-1 bg-input border-border/60 focus:border-primary/50 text-sm"
                />
                {form.parkingLotItems.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeParkingItem(item.id)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs border-dashed border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40"
            onClick={addParkingItem}
            data-ocid="form.add_parking_button"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Item
          </Button>
        </motion.div>

        {/* ── Error state ── */}
        {isError && (
          <div
            className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
            data-ocid="form.error_state"
          >
            Failed to save record. Please try again.
          </div>
        )}

        {/* ── Action buttons ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          className="flex gap-3"
        >
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-11"
            data-ocid="form.save_button"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Record
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (isEdit && editId !== null) {
                navigate({
                  to: "/record/$id",
                  params: { id: editId.toString() },
                });
              } else {
                navigate({ to: "/new/transcript" });
              }
            }}
            disabled={isPending}
            className="h-11 px-5 border-border/60 text-muted-foreground hover:text-foreground"
            data-ocid="form.cancel_button"
          >
            Cancel
          </Button>
        </motion.div>

        {/* success state (toast handles it, but marker for test coverage) */}
        {(createMutation.isSuccess || updateMutation.isSuccess) && (
          <div data-ocid="form.success_state" className="hidden" />
        )}
      </main>
    </div>
  );
}
