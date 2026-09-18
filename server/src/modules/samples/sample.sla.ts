type SampleTestStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type SlaStatus =
  | "SAFE"
  | "AT_RISK"
  | "BREACHED"
  | "COMPLETED"
  | "NOT_APPLICABLE";

export function calculateSlaStatus(
  dueAt: Date,
  status: SampleTestStatus
) {
  if (status === "COMPLETED") {
    return {
      slaStatus: "COMPLETED" as const,
      minutesRemaining: 0,
    };
  }

  if (
    status === "FAILED" ||
    status === "CANCELLED"
  ) {
    return {
      slaStatus: "NOT_APPLICABLE" as const,
      minutesRemaining: null,
    };
  }

  const now = new Date();

  const differenceMs =
    dueAt.getTime() - now.getTime();

  const minutesRemaining = Math.ceil(
    differenceMs / (1000 * 60)
  );

  if (minutesRemaining < 0) {
    return {
      slaStatus: "BREACHED" as const,
      minutesRemaining,
    };
  }

  if (minutesRemaining <= 30) {
    return {
      slaStatus: "AT_RISK" as const,
      minutesRemaining,
    };
  }

  return {
    slaStatus: "SAFE" as const,
    minutesRemaining,
  };
}

type TestForSla = {
  dueAt: Date;
  status:
    | "PENDING"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "FAILED"
    | "CANCELLED";
};

export function calculateOverallSlaStatus(
  tests: TestForSla[]
) {
  if (tests.length === 0) {
    return "NOT_APPLICABLE" as const;
  }

  const statuses = tests.map((test) =>
    calculateSlaStatus(
      test.dueAt,
      test.status
    ).slaStatus
  );

  if (statuses.includes("BREACHED")) {
    return "BREACHED" as const;
  }

  if (statuses.includes("AT_RISK")) {
    return "AT_RISK" as const;
  }

  if (
    statuses.every(
      (status) =>
        status === "COMPLETED" ||
        status === "NOT_APPLICABLE"
    )
  ) {
    return "COMPLETED" as const;
  }

  return "SAFE" as const;
}