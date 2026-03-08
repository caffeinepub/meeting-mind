import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ActionItem {
    owner: string;
    task: string;
    deadline: string;
}
export interface DiscussionTopic {
    perspectives: string;
    consensus: string;
    category: string;
}
export interface MeetingRecord {
    id: bigint;
    title: string;
    participants: Array<string>;
    date: string;
    createdBy: Principal;
    decisions: Array<string>;
    parkingLotItems: Array<string>;
    actionItems: Array<ActionItem>;
    executiveSummary: string;
    discussionTopics: Array<DiscussionTopic>;
    createdTimestamp: bigint;
    transcript?: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createMeetingRecord(title: string, date: string, participants: Array<string>, executiveSummary: string, decisions: Array<string>, actionItems: Array<ActionItem>, discussionTopics: Array<DiscussionTopic>, parkingLotItems: Array<string>, transcript: string | null): Promise<bigint>;
    deleteMeetingRecord(id: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMeetingRecord(id: bigint): Promise<MeetingRecord | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listAllMeetingRecords(): Promise<Array<MeetingRecord>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateMeetingRecord(id: bigint, title: string, date: string, participants: Array<string>, executiveSummary: string, decisions: Array<string>, actionItems: Array<ActionItem>, discussionTopics: Array<DiscussionTopic>, parkingLotItems: Array<string>, transcript: string | null): Promise<void>;
}
