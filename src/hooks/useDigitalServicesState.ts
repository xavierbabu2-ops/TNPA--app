import { useState } from "react";
import { Task, KnowledgeArticle, UserAccount } from "../types";

export function useDigitalServicesState() {
  const [activeSubTab, setActiveSubTab] = useState<
    "job_portal" | "academy" | "certification" | "help_desk" | "insurance_legal" | "other"
  >("job_portal");
  const [complaints, setComplaints] = useState<any[]>([]);
  const [activeComplaintId, setActiveComplaintId] = useState<string | null>(null);
  const [newCompSubject, setNewCompSubject] = useState("");
  const [newCompCategory, setNewCompCategory] = useState("general");
  const [newCompDesc, setNewCompDesc] = useState("");
  const [newCompDoc, setNewCompDoc] = useState("");
  const [complaintChatInput, setComplaintChatInput] = useState("");
  const [voiceResponse, setVoiceResponse] = useState("");
  const [voiceInputActive, setVoiceInputActive] = useState(false);
  const [callbacks, setCallbacks] = useState<any[]>([]);
  const [callPhone, setCallPhone] = useState("");
  const [callDateTime, setCallDateTime] = useState("");
  const [callTopic, setCallTopic] = useState("");
  const [callConsent, setCallConsent] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [insurancePolicies, setInsurancePolicies] = useState<any[]>([]);
  const [claimPolicyId, setClaimPolicyId] = useState("");
  const [claimReason, setClaimReason] = useState("");
  const [claimDoc, setClaimDoc] = useState("");
  const [skillSubmissions, setSkillSubmissions] = useState<any[]>([]);
  const [submitSkills, setSubmitSkills] = useState("");
  const [submitExp, setSubmitExp] = useState("");
  const [submitPortfolio, setSubmitPortfolio] = useState("");
  const [publishCompany, setPublishCompany] = useState("");
  const [publishServices, setPublishServices] = useState("");
  const [publishExp, setPublishExp] = useState("");
  const [publishContact, setPublishContact] = useState("");
  const [publishOptIn, setPublishOptIn] = useState(true);
  const [contractors, setContractors] = useState<any[]>([]);
  const [opinionPolls, setOpinionPolls] = useState<any[]>([]);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [suspiciousLogins, setSuspiciousLogins] = useState<any[]>([]);
  const [cpuLoad, setCpuLoad] = useState(42);
  const [dbHealth, setDbHealth] = useState("HEALTHY (Active Connections: 148)");
  const [storageUsed, setStorageUsed] = useState(38);
  const [apiLatency, setApiLatency] = useState(140);
  const [systemErrorLogs, setSystemErrorLogs] = useState<any[]>([]);

  return {
    activeSubTab, setActiveSubTab,
    complaints, setComplaints,
    activeComplaintId, setActiveComplaintId,
    newCompSubject, setNewCompSubject,
    newCompCategory, setNewCompCategory,
    newCompDesc, setNewCompDesc,
    newCompDoc, setNewCompDoc,
    complaintChatInput, setComplaintChatInput,
    voiceResponse, setVoiceResponse,
    voiceInputActive, setVoiceInputActive,
    callbacks, setCallbacks,
    callPhone, setCallPhone,
    callDateTime, setCallDateTime,
    callTopic, setCallTopic,
    callConsent, setCallConsent,
    tasks, setTasks,
    insurancePolicies, setInsurancePolicies,
    claimPolicyId, setClaimPolicyId,
    claimReason, setClaimReason,
    claimDoc, setClaimDoc,
    skillSubmissions, setSkillSubmissions,
    submitSkills, setSubmitSkills,
    submitExp, setSubmitExp,
    submitPortfolio, setSubmitPortfolio,
    publishCompany, setPublishCompany,
    publishServices, setPublishServices,
    publishExp, setPublishExp,
    publishContact, setPublishContact,
    publishOptIn, setPublishOptIn,
    contractors, setContractors,
    opinionPolls, setOpinionPolls,
    mfaEnabled, setMfaEnabled,
    suspiciousLogins, setSuspiciousLogins,
    cpuLoad, setCpuLoad,
    dbHealth, setDbHealth,
    storageUsed, setStorageUsed,
    apiLatency, setApiLatency,
    systemErrorLogs, setSystemErrorLogs
  };
}
