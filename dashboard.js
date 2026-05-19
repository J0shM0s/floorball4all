const tools = window.floorballData;
const loadingInfo = document.querySelector(".loading-info");
const tableBody = document.querySelector(".dashboard-table tbody");

const setMetric = (selector, value) => {
  const element = document.querySelector(selector);
  if (element) element.textContent = `${Math.round(value)}`;
};

const hasData = (profile) =>
  [profile.trainerCount, profile.trainingCount, profile.participantCount].some(
    (value) => tools.toNumber(value) > 0,
  );

const renderDashboard = async () => {
  try {
    const { countryProfiles } = await tools.loadCountryProfiles();
    const profiles = Object.values(countryProfiles).filter(hasData);
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

    tableBody.innerHTML = profiles
      .sort((a, b) => tools.toNumber(b.participantCount) - tools.toNumber(a.participantCount))
      .slice(0, 10)
      .map((profile) => `
        <tr>
          <td><strong>${profile.name}</strong></td>
          <td>${Math.round(tools.toNumber(profile.trainerCount)) || "-"}</td>
          <td>${Math.round(tools.toNumber(profile.trainingCount)) || "-"}</td>
          <td>${Math.round(tools.toNumber(profile.participantCount)) || "-"}</td>
          <td><a class="table-link" href="compare.html?country=${encodeURIComponent(profile.name)}">Vergleichen</a></td>
        </tr>
      `)
      .join("");

    loadingInfo.style.display = "none";
  } catch (error) {
    console.error("Dashboard konnte nicht geladen werden:", error);
    loadingInfo.textContent = window.floorballI18n?.t("loadError") || "Fehler beim Laden der Daten!";
  }
};

renderDashboard();
