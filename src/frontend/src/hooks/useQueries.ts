import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ActionItem, DiscussionTopic, MeetingRecord } from "../backend.d";
import { useActor } from "./useActor";

// ── Query keys ───────────────────────────────────────────
export const QK = {
  meetingRecords: ["meetingRecords"] as const,
  meetingRecord: (id: bigint) => ["meetingRecord", id.toString()] as const,
};

// ── Queries ──────────────────────────────────────────────
export function useMeetingRecords() {
  const { actor, isFetching } = useActor();
  return useQuery<MeetingRecord[]>({
    queryKey: QK.meetingRecords,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllMeetingRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMeetingRecord(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<MeetingRecord | null>({
    queryKey: QK.meetingRecord(id ?? BigInt(0)),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getMeetingRecord(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

// ── Mutations ─────────────────────────────────────────────
export function useCreateMeetingRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      title: string;
      date: string;
      participants: string[];
      executiveSummary: string;
      decisions: string[];
      actionItems: ActionItem[];
      discussionTopics: DiscussionTopic[];
      parkingLotItems: string[];
      transcript: string | null;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createMeetingRecord(
        vars.title,
        vars.date,
        vars.participants,
        vars.executiveSummary,
        vars.decisions,
        vars.actionItems,
        vars.discussionTopics,
        vars.parkingLotItems,
        vars.transcript,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.meetingRecords }),
  });
}

export function useUpdateMeetingRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      id: bigint;
      title: string;
      date: string;
      participants: string[];
      executiveSummary: string;
      decisions: string[];
      actionItems: ActionItem[];
      discussionTopics: DiscussionTopic[];
      parkingLotItems: string[];
      transcript: string | null;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateMeetingRecord(
        vars.id,
        vars.title,
        vars.date,
        vars.participants,
        vars.executiveSummary,
        vars.decisions,
        vars.actionItems,
        vars.discussionTopics,
        vars.parkingLotItems,
        vars.transcript,
      );
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: QK.meetingRecords });
      qc.invalidateQueries({ queryKey: QK.meetingRecord(vars.id) });
    },
  });
}

export function useDeleteMeetingRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteMeetingRecord(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.meetingRecords }),
  });
}
