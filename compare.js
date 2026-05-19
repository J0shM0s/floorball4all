let countryData = {};
let chartInstance = null;

const getUiText = (key) => window.floorballI18n?.t(key) || key;
const getDataTools = () => window.floorballData;

const country1Select = document.getElementById("country1-select");
const country2Select = document.getElementById("country2-select");
const tableCountry1 = document.getElementById("table-country1");
const tableCountry2 = document.getElementById("table-country2");
const summaryCards = document.querySelector(".comparison-summary");

const normalizeCountryName = (name) => getDataTools().normalizeCountryName(name);

const populateCountrySelects = () => {
  const countryNames = Object.keys(countryData).sort((a, b) => a.localeCompare(b));

  [country1Select, country2Select].forEach((select) => {
    const currentValue = select.value;
    select.querySelectorAll("option:not([value=''])").forEach((option) => option.remove());

    countryNames.forEach((country) => {
      const option = document.createElement("option");
      option.value = country;
      option.textContent = country;
      select.appendChild(option);
    });

    select.value = countryNames.includes(currentValue) ? currentValue : "";
  });
};

const applyPresetFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const preset = params.get("country");
  if (!preset) return;

  const matchingCountry = Object.keys(countryData).find(
    (country) => normalizeCountryName(country) === normalizeCountryName(preset),
  );

  if (matchingCountry) {
    country1Select.value = matchingCountry;
    const fallbackCountry = Object.keys(countryData).find((country) => country !== matchingCountry);
    if (fallbackCountry && !country2Select.value) country2Select.value = fallbackCountry;
    updateCharts();
  }
};

async function loadCountryData() {
  try {
    const { countryProfiles } = await getDataTools().loadCountryProfiles();
    countryData = {};

    Object.values(countryProfiles).forEach((profile) => {
      countryData[profile.name] = {
        name: profile.name,
        trainerCount: getDataTools().toNumber(profile.trainerCount),
        startYear: parseInt(profile.startYear, 10) || 0,
        trainingCount: getDataTools().toNumber(profile.trainingCount),
        participantCount: getDataTools().toNumber(profile.participantCount),
        normalized: normalizeCountryName(profile.name),
      };
    });

    populateCountrySelects();
    applyPresetFromUrl();
    document.querySelector(".loading-info").style.display = "none";
  } catch (error) {
    console.error("Fehler beim Laden der Daten:", error);
    document.querySelector(".loading-info").textContent = getUiText("loadError");
  }
}

const extractValue = (value) => {
  if (!Number.isFinite(value) || value <= 0) return getUiText("noData");
  return value;
};

const formatComparisonText = (type, value) => {
  const formattedValue = extractValue(value);
  if (formattedValue === getUiText("noData")) {
    return `<span class="comparison-text">${getUiText("noData")}</span>`;
  }

  switch (type) {
    case "trainer":
      return `<span class="comparison-text">${getUiText("trainedTrainers")}<br><strong>${getUiText("approx")} ${Math.round(formattedValue)} ${getUiText("trainers")}</strong></span>`;
    case "training":
      return `<span class="comparison-text">${getUiText("regularTrainingsLabel")}<br><strong>${getUiText("approx")} ${Math.round(formattedValue)}</strong></span>`;
    case "participant":
      return `<span class="comparison-text">${getUiText("totalParticipants")}<br><strong>${getUiText("approx")} ${Math.round(formattedValue)}</strong></span>`;
    default:
      return `<span class="comparison-text">${formattedValue}</span>`;
  }
};

function updateTableComparison(data1, data2, name1, name2) {
  tableCountry1.textContent = name1;
  tableCountry2.textContent = name2;

  document.getElementById("trainer-c1").innerHTML = formatComparisonText("trainer", data1.trainerCount);
  document.getElementById("trainer-c2").innerHTML = formatComparisonText("trainer", data2.trainerCount);
  document.getElementById("training-c1").innerHTML = formatComparisonText("training", data1.trainingCount);
  document.getElementById("training-c2").innerHTML = formatComparisonText("training", data2.trainingCount);
  document.getElementById("participant-c1").innerHTML = formatComparisonText("participant", data1.participantCount);
  document.getElementById("participant-c2").innerHTML = formatComparisonText("participant", data2.participantCount);
}

const renderSummaryCards = (data1, data2) => {
  if (!summaryCards) return;
  const differences = [
    { label: getUiText("trainers"), value: data1.trainerCount - data2.trainerCount },
    { label: getUiText("trainings"), value: data1.trainingCount - data2.trainingCount },
    { label: getUiText("participants"), value: data1.participantCount - data2.participantCount },
  ];

  summaryCards.innerHTML = differences
    .map(({ label, value }) => {
      const prefix = value > 0 ? "+" : "";
      return `<article class="metric-card"><span>${label}</span><strong>${prefix}${Math.round(value)}</strong></article>`;
    })
    .join("");
};

function updateBarChart(data1, data2, name1, name2) {
  const ctx = document.getElementById("comparisonChart").getContext("2d");

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [getUiText("trainers"), getUiText("trainings"), `${getUiText("participants")} / 10`],
      datasets: [
        {
          label: name1,
          data: [data1.trainerCount, data1.trainingCount, data1.participantCount / 10],
          backgroundColor: "rgba(96, 176, 191, 0.75)",
          borderColor: "rgba(96, 176, 191, 1)",
          borderWidth: 2,
        },
        {
          label: name2,
          data: [data2.trainerCount, data2.trainingCount, data2.participantCount / 10],
          backgroundColor: "rgba(229, 169, 46, 0.75)",
          borderColor: "rgba(229, 169, 46, 1)",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { labels: { color: "#fff", font: { size: 12 } } },
        tooltip: {
          callbacks: {
            label: (context) => `${context.dataset.label}: ${Math.round(context.raw)}`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#fff" },
          grid: { color: "rgba(255, 255, 255, 0.1)" },
        },
        x: {
          ticks: { color: "#fff" },
          grid: { color: "rgba(255, 255, 255, 0.1)" },
        },
      },
    },
  });
}

function updateCharts() {
  const c1 = country1Select.value;
  const c2 = country2Select.value;
  if (!c1 || !c2) return;

  const data1 = countryData[c1];
  const data2 = countryData[c2];
  updateTableComparison(data1, data2, c1, c2);
  renderSummaryCards(data1, data2);
  updateBarChart(data1, data2, c1, c2);
}

country1Select.addEventListener("change", updateCharts);
country2Select.addEventListener("change", updateCharts);
window.addEventListener("floorball-language-change", updateCharts);

loadCountryData();
