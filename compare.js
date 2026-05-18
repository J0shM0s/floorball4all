// Google Sheet CSV laden
const googleSheetUrl = "https://docs.google.com/spreadsheets/d/1iBUeTag4z7L6-jZAaYyJck9_vimowPV1-3MaQqX2Dbw/export?format=csv";

let countryData = {};
let chartInstance = null;
let radarChartInstance = null;
const getUiText = (key) => window.floorballI18n?.t(key) || key;

// DOM Elements
const country1Select = document.getElementById("country1-select");
const country2Select = document.getElementById("country2-select");
const tableCountry1 = document.getElementById("table-country1");
const tableCountry2 = document.getElementById("table-country2");

// Normalisierung des Ländernamens
const normalizeCountryName = (name) => {
    return `${name || ""}`
        .trim()
        .toLowerCase()
        .replace(/ä/g, "ae")
        .replace(/ö/g, "oe")
        .replace(/ü/g, "ue")
        .replace(/ß/g, "ss")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
};

// Daten vom Google Sheet parsen
async function loadCountryData() {
    try {
        const response = await fetch(googleSheetUrl);
        const csvText = await response.text();
        const lines = csvText.split("\n").filter(line => line.trim());
        
        // CSV in Daten umwandeln
        lines.slice(1).forEach((line) => {
            const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
            
            if (values.length >= 5) {
                const country = values[0];
                const trainerCount = values[1];
                const startYear = values[2];
                const trainingCount = values[3];
                const participantCount = values[4];
                
                if (country) {
                    countryData[country] = {
                        name: country,
                        trainerCount: parseFloat(trainerCount) || 0,
                        startYear: parseInt(startYear) || 0,
                        trainingCount: parseFloat(trainingCount) || 0,
                        participantCount: parseFloat(participantCount) || 0,
                        normalized: normalizeCountryName(country)
                    };
                }
            }
        });
        
        // Selects mit Ländern füllen
        populateCountrySelects();
        document.querySelector(".loading-info").style.display = "none";
    } catch (error) {
        console.error("Fehler beim Laden der Daten:", error);
        document.querySelector(".loading-info").textContent = getUiText("loadError");
    }
}

// Select Dropdowns füllen
function populateCountrySelects() {
    const countryNames = Object.keys(countryData).sort();
    
    countryNames.forEach(country => {
        const option1 = document.createElement("option");
        option1.value = country;
        option1.textContent = country;
        country1Select.appendChild(option1);
        
        const option2 = document.createElement("option");
        option2.value = country;
        option2.textContent = country;
        country2Select.appendChild(option2);
    });
}

// Wert extrahieren (Nummer oder "Keine Angabe")
function extractValue(value) {
    if (!Number.isFinite(value) || value <= 0) return getUiText("noData");
    return value;
}

function formatComparisonText(type, value) {
    const formattedValue = extractValue(value);
    if (formattedValue === getUiText("noData")) return `<span class="comparison-text">${getUiText("noData")}</span>`;

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
}

// Diagramme aktualisieren
function updateCharts() {
    const c1 = country1Select.value;
    const c2 = country2Select.value;
    
    if (!c1 || !c2) return;
    
    const data1 = countryData[c1];
    const data2 = countryData[c2];
    
    updateTableComparison(data1, data2, c1, c2);
    updateBarChart(data1, data2, c1, c2);
}

// Tabelle aktualisieren
function updateTableComparison(data1, data2, name1, name2) {
    // Landnamen aktualisieren
    tableCountry1.textContent = name1;
    tableCountry2.textContent = name2;
    
    // Trainer
    document.getElementById("trainer-c1").innerHTML = formatComparisonText("trainer", data1.trainerCount);
    document.getElementById("trainer-c2").innerHTML = formatComparisonText("trainer", data2.trainerCount);
    
    // Trainings
    document.getElementById("training-c1").innerHTML = formatComparisonText("training", data1.trainingCount);
    document.getElementById("training-c2").innerHTML = formatComparisonText("training", data2.trainingCount);
    
    // Teilnehmer
    document.getElementById("participant-c1").innerHTML = formatComparisonText("participant", data1.participantCount);
    document.getElementById("participant-c2").innerHTML = formatComparisonText("participant", data2.participantCount);
}

// Balkendiagramm erstellen/aktualisieren
function updateBarChart(data1, data2, name1, name2) {
    const ctx = document.getElementById("comparisonChart").getContext("2d");
    
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: [getUiText("trainers"), getUiText("trainings"), getUiText("participants")],
            datasets: [
                {
                    label: name1,
                    data: [
                        data1.trainerCount,
                        data1.trainingCount,
                        data1.participantCount / 10 // Skaliert für bessere Anzeige
                    ],
                    backgroundColor: "rgba(96, 176, 191, 0.7)",
                    borderColor: "rgba(96, 176, 191, 1)",
                    borderWidth: 2
                },
                {
                    label: name2,
                    data: [
                        data2.trainerCount,
                        data2.trainingCount,
                        data2.participantCount / 10
                    ],
                    backgroundColor: "rgba(229, 169, 46, 0.7)",
                    borderColor: "rgba(229, 169, 46, 1)",
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: "#fff",
                        font: {
                            size: 12
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: "#fff"
                    },
                    grid: {
                        color: "rgba(255, 255, 255, 0.1)"
                    }
                },
                x: {
                    ticks: {
                        color: "#fff"
                    },
                    grid: {
                        color: "rgba(255, 255, 255, 0.1)"
                    }
                }
            }
        }
    });
}

// Radar Diagramm erstellen/aktualisieren
function updateRadarChart(data1, data2, name1, name2) {
    const ctx = document.getElementById("radarChart").getContext("2d");
    
    if (radarChartInstance) {
        radarChartInstance.destroy();
    }
    
    radarChartInstance = new Chart(ctx, {
        type: "radar",
        data: {
            labels: [getUiText("trainers"), getUiText("trainings"), getUiText("participants")],
            datasets: [
                {
                    label: name1,
                    data: [
                        data1.trainerCount,
                        data1.trainingCount,
                        data1.participantCount / 10 // Normalisiert
                    ],
                    borderColor: "rgba(96, 176, 191, 1)",
                    backgroundColor: "rgba(96, 176, 191, 0.2)",
                    borderWidth: 2,
                    pointBackgroundColor: "rgba(96, 176, 191, 1)",
                    pointBorderColor: "#fff",
                    pointHoverBackgroundColor: "#fff",
                    pointHoverBorderColor: "rgba(96, 176, 191, 1)"
                },
                {
                    label: name2,
                    data: [
                        data2.trainerCount,
                        data2.trainingCount,
                        data2.participantCount / 10
                    ],
                    borderColor: "rgba(229, 169, 46, 1)",
                    backgroundColor: "rgba(229, 169, 46, 0.2)",
                    borderWidth: 2,
                    pointBackgroundColor: "rgba(229, 169, 46, 1)",
                    pointBorderColor: "#fff",
                    pointHoverBackgroundColor: "#fff",
                    pointHoverBorderColor: "rgba(229, 169, 46, 1)"
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: "#fff",
                        font: {
                            size: 12
                        }
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    ticks: {
                        color: "#fff"
                    },
                    grid: {
                        color: "rgba(255, 255, 255, 0.1)"
                    }
                }
            }
        }
    });
}

// Event Listener
country1Select.addEventListener("change", updateCharts);
country2Select.addEventListener("change", updateCharts);

window.addEventListener("floorball-language-change", () => {
    updateCharts();
});

// Daten laden beim Start
loadCountryData();
