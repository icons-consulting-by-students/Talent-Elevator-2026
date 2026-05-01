(function () {
  const phaseConfig = {
    viennaZone: "Europe/Vienna",
    useTestStartDate: false,
    originalStartUtcMs: Date.UTC(2026, 3, 5, 22, 0, 0),
    testStartUtcMs: Date.UTC(2026, 3, 5, 22, 0, 0),
    endExclusiveUtcMs: Date.UTC(2026, 3, 30, 22, 0, 0),
  };

  const startUtcMs = phaseConfig.useTestStartDate ? phaseConfig.testStartUtcMs : phaseConfig.originalStartUtcMs;

  function getState(nowMs) {
    if (nowMs < startUtcMs) {
      return "before";
    }
    if (nowMs >= phaseConfig.endExclusiveUtcMs) {
      return "after";
    }
    return "active";
  }

  window.TEApplicationPhase = {
    viennaZone: phaseConfig.viennaZone,
    useTestStartDate: phaseConfig.useTestStartDate,
    originalStartUtcMs: phaseConfig.originalStartUtcMs,
    testStartUtcMs: phaseConfig.testStartUtcMs,
    startUtcMs: startUtcMs,
    endExclusiveUtcMs: phaseConfig.endExclusiveUtcMs,
    getState: getState,
    isActive: function (nowMs) {
      return getState(typeof nowMs === "number" ? nowMs : Date.now()) === "active";
    },
  };
})();
