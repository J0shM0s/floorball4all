const tools = window.floorballData;
const loadingInfo = document.querySelector(".loading-info");
const tableBody = document.querySelector(".dashboard-table tbody");
const exportButton = document.querySelector(".dashboard-export-button");
const adminLoginButton = document.querySelector(".admin-login-button");
const adminModal = document.querySelector(".admin-modal");
const adminCloseButton = document.querySelector(".admin-close-button");
const adminLoginForm = document.querySelector(".admin-login-form");
const adminPasswordInput = document.querySelector(".admin-password-input");
const adminMessage = document.querySelector(".admin-message");
let dashboardProfiles = [];

const unlockArchivePage = () => {
  try {
    sessionStorage.setItem("floorball4all_archive_unlocked", "true");
    localStorage.setItem("floorball4all_archive_unlocked", "true");
  } catch (error) {
    console.warn("Interner Bereich konnte nicht freigeschaltet werden.", error);
  }

  window.location.href = "archive.html";
};

const openAdminModal = () => {
  adminModal?.classList.remove("hide");
  if (adminMessage) adminMessage.textContent = "";
  adminPasswordInput?.focus();
};

const closeAdminModal = () => {
  adminModal?.classList.add("hide");
  if (adminPasswordInput) adminPasswordInput.value = "";
  if (adminMessage) adminMessage.textContent = "";
};

const setMetric = (selector, value) => {
  const element = document.querySelector(selector);
  if (element) element.textContent = `${Math.round(value)}`;
};

const hasData = (profile) => tools.hasProfileData(profile);
const formatCount = (value, unit) => {
  const number = tools.toNumber(value);
  if (!number) return "-";
  return tools.formatCountWithUnit(number, unit);
};

const renderDashboard = async () => {
  try {
    const { countryProfiles } = await tools.loadCountryProfiles();
    const profiles = Object.values(countryProfiles).filter(hasData);
    dashboardProfiles = profiles
      .slice()
      .sort((a, b) => tools.toNumber(b.participantCount) - tools.toNumber(a.participantCount));
    const totals = profiles.reduce(
      (sum, profile) => ({
        trainers: sum.trainers + tools.toNumber(profile.trainerCount),
        trainings: sum.trainings + tools.toNumber(profile.trainingCount),
        participants: sum.participants + tools.toNumber(profile.participantCount),
      }),
      { trainers: 0, trainings: 0, participants: 0 },
    );

    setMetric(".dashboard-countries", profiles.length);
    setMetric(".dashboard-trainers", totals.trainers);
    setMetric(".dashboard-trainings", totals.trainings);
    setMetric(".dashboard-participants", totals.participants);

    tableBody.innerHTML = dashboardProfiles
      .slice(0, 10)
      .map((profile) => `
        <tr>
          <td><strong>${profile.name}</strong></td>
          <td>${formatCount(profile.trainerCount, "Trainer")}</td>
          <td>${formatCount(profile.trainingCount, "Trainings")}</td>
          <td>${formatCount(profile.participantCount, "Teilnehmer")}</td>
          <td><a class="table-link" href="compare.html?country=${encodeURIComponent(profile.name)}">Vergleichen</a></td>
        </tr>
      `)
      .join("");

    if (exportButton) exportButton.disabled = dashboardProfiles.length === 0;
    loadingInfo.style.display = "none";
  } catch (error) {
    console.error("Dashboard konnte nicht geladen werden:", error);
    loadingInfo.textContent = window.floorballI18n?.t("loadError") || "Fehler beim Laden der Daten!";
  }
};

const exportDashboardCsv = () => {
  if (!dashboardProfiles.length) return;

  tools.downloadCsv(
    "floorball4all-dashboard.csv",
    ["Land", "Trainer", "Startjahr", "Trainings", "Teilnehmende"],
    dashboardProfiles.map((profile) => [
      profile.name,
      formatCount(profile.trainerCount, "Trainer"),
      profile.startYear || "",
      formatCount(profile.trainingCount, "Trainings"),
      formatCount(profile.participantCount, "Teilnehmer"),
    ]),
  );
};

exportButton?.addEventListener("click", exportDashboardCsv);
adminLoginButton?.addEventListener("click", openAdminModal);
adminCloseButton?.addEventListener("click", closeAdminModal);
adminModal?.addEventListener("click", (event) => {
  if (event.target === adminModal) closeAdminModal();
});

adminLoginForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (adminPasswordInput.value === "0000") {
    adminPasswordInput.value = "";
    if (adminMessage) adminMessage.textContent = "Interner Bereich wird geöffnet...";
    unlockArchivePage();
    return;
  }

  if (adminMessage) adminMessage.textContent = "Falscher Code.";
  adminPasswordInput.select();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !adminModal?.classList.contains("hide")) {
    closeAdminModal();
    adminLoginButton?.focus();
  }
});

renderDashboard();
