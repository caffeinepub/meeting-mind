import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Migration "migration";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

(with migration = Migration.run)
actor {
  public type ActionItem = {
    task : Text;
    owner : Text;
    deadline : Text;
  };

  public type DiscussionTopic = {
    category : Text;
    perspectives : Text;
    consensus : Text;
  };

  public type MeetingRecord = {
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

  public type UserProfile = {
    name : Text;
  };

  // Persistent storage for meeting records
  var nextRecordId = 1;
  let meetingRecords = Map.empty<Nat, MeetingRecord>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Storage system
  include MixinStorage();

  // User Profile Management Methods
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Meeting Record Management Methods
  public shared ({ caller }) func createMeetingRecord(
    title : Text,
    date : Text,
    participants : [Text],
    executiveSummary : Text,
    decisions : [Text],
    actionItems : [ActionItem],
    discussionTopics : [DiscussionTopic],
    parkingLotItems : [Text],
    transcript : ?Text
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create meeting records");
    };

    let id = nextRecordId;
    let record : MeetingRecord = {
      id;
      title;
      date;
      participants;
      executiveSummary;
      decisions;
      actionItems;
      discussionTopics;
      parkingLotItems;
      transcript;
      createdTimestamp = Time.now();
      createdBy = caller;
    };

    meetingRecords.add(id, record);
    nextRecordId += 1;
    id;
  };

  public query ({ caller }) func getMeetingRecord(id : Nat) : async ?MeetingRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view meeting records");
    };
    meetingRecords.get(id);
  };

  public shared ({ caller }) func updateMeetingRecord(
    id : Nat,
    title : Text,
    date : Text,
    participants : [Text],
    executiveSummary : Text,
    decisions : [Text],
    actionItems : [ActionItem],
    discussionTopics : [DiscussionTopic],
    parkingLotItems : [Text],
    transcript : ?Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update meeting records");
    };

    switch (meetingRecords.get(id)) {
      case (null) { Runtime.trap("Meeting record not found") };
      case (?existing) {
        // Only the creator or an admin can update the record
        if (existing.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the creator or an admin can update this meeting record");
        };

        let updatedRecord : MeetingRecord = {
          id;
          title;
          date;
          participants;
          executiveSummary;
          decisions;
          actionItems;
          discussionTopics;
          parkingLotItems;
          transcript;
          createdTimestamp = existing.createdTimestamp;
          createdBy = existing.createdBy;
        };
        meetingRecords.add(id, updatedRecord);
      };
    };
  };

  public shared ({ caller }) func deleteMeetingRecord(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete meeting records");
    };

    if (not meetingRecords.containsKey(id)) {
      Runtime.trap("Meeting record not found");
    };
    meetingRecords.remove(id);
  };

  public query ({ caller }) func listAllMeetingRecords() : async [MeetingRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list meeting records");
    };
    meetingRecords.values().toArray();
  };
};
