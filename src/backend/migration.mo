import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  // Action Item and Discussion Topic Types
  type ActionItem = {
    task : Text;
    owner : Text;
    deadline : Text;
  };

  type DiscussionTopic = {
    category : Text;
    perspectives : Text;
    consensus : Text;
  };

  // Meeting Record Storage Type
  type MeetingRecord = {
    id : Nat;
    title : Text;
    date : Text;
    participants : [Text];
    executiveSummary : Text;
    decisions : [Text];
    actionItems : [ActionItem];
    discussionTopics : [DiscussionTopic];
    parkingLotItems : [Text];
    transcript : ?Text;
    createdTimestamp : Int;
    createdBy : Principal;
  };

  type UserProfile = {
    name : Text;
  };

  // Legacy Finance App Types
  type Transaction = {
    id : Nat;
    date : Int;
    category : Text;
    amount : Float;
    note : ?Text;
  };

  type SavingsGoal = {
    id : Nat;
    name : Text;
    targetAmount : Float;
    currentAmount : Float;
  };

  type FinanceUserProfile = {
    name : Text;
  };

  type FinanceUserSettings = {
    monthlyIncome : Float;
  };

  type OldActor = {
    nextTransactionId : Map.Map<Principal, Nat>;
    nextSavingsGoalId : Map.Map<Principal, Nat>;
    transactions : Map.Map<Principal, Map.Map<Nat, Transaction>>;
    savingsGoals : Map.Map<Principal, Map.Map<Nat, SavingsGoal>>;
    userProfiles : Map.Map<Principal, FinanceUserProfile>;
    userSettings : Map.Map<Principal, FinanceUserSettings>;
    seeded : Map.Map<Principal, Bool>;
  };

  type NewActor = {
    meetingRecords : Map.Map<Nat, MeetingRecord>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  public func run(_ : OldActor) : NewActor {
    let meetingRecords = Map.empty<Nat, MeetingRecord>();
    {
      meetingRecords;
      userProfiles = Map.empty<Principal, UserProfile>();
    };
  };
};
