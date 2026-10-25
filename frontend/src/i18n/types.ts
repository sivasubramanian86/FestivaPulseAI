export type SupportedLanguage = 'en' | 'ta' | 'hi' | 'es';

export interface TranslationDictionary {
  nav: {
    brandSubtitle: string;
    blueprintTab: string;
    pulseTab: string;
    rescueTab: string;
    ledgerTab: string;
    scenarioTab: string;
    xrayButton: string;
    qaTestButton: string;
    themeToggle: string;
  };
  metrics: {
    guestAttendance: string;
    budgetStatus: string;
    foodSufficiency: string;
    soundCurfew: string;
    carbonAbatement: string;
    venueCapacity: string;
    spent: string;
    contingency: string;
  };
  blueprint: {
    title: string;
    subtitle: string;
    intakeHeader: string;
    generateButton: string;
    generating: string;
    eventName: string;
    guests: string;
    budget: string;
    location: string;
    date: string;
    culturalVibe: string;
    timelineSchedule: string;
    budgetBreakdown: string;
    foodRadarTitle: string;
  };
  pulse: {
    title: string;
    subtitle: string;
    gateCheckIn: string;
    buffetLine: string;
    acousticMonitor: string;
    fssaiDispatch: string;
    fssaiButton: string;
    dispatchSuccess: string;
  };
  rescue: {
    title: string;
    subtitle: string;
    incidentDetected: string;
    comparativeMatrix: string;
    lowestCost: string;
    bestExperience: string;
    lowestDisruption: string;
    approveButton: string;
    approvedSuccess: string;
    rejectionRationale: string;
    zeroHallucinationProof: string;
  };
  ledger: {
    title: string;
    subtitle: string;
    filterAll: string;
    immutableProof: string;
    signedByCoordinator: string;
    planVersion: string;
    calculationsAudited: string;
  };
  common: {
    statusSafe: string;
    statusWarning: string;
    statusCritical: string;
    feasible: string;
    infeasible: string;
    loading: string;
  };
}
