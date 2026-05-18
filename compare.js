const googleSheetUrl = "https://docs.google.com/spreadsheets/d/1iBUeTag4z7L6-jZAaYyJck9_vimowPV1-3MaQqX2Dbw/export?format=csv";

let countryData = {};
let chartInstance = null;
let radarChartInstance = null;
const getUiText = (key) => window.floorballI18n?.t(key) || key;

const parseCsv = (csvText) => {
    const rows = [];
    let row = [];
    let value = "";
    let insideQuotes = false;

    for (let index = 0; index < csvText.length; index++) {
        const character = csvText[index];
        const nextCharacter = csvText[index + 1];

        if (character === '"') {
            if (insideQuotes && nextCharacter === '"') {
                value += '"';
                index++;
            } else {
                insideQuotes = !insideQuotes;
            }
            continue;
        }

        if (character === "," && !insideQuotes) {
            row.push(value);
            value = "";
            continue;
        }

        if ((character === "\n" || character === "\r") && !insideQuotes) {
            if (character === "\r" && nextCharacter === "\n") index++;
            row.push(value);
            if (row.some((cell) => cell.trim())) rows.push(row);
            row = [];
            value = "";
            continue;
        }

        value += character;
    }

    row.push(value);
    if (row.some((cell) => cell.trim())) rows.push(row);
    return rows;
};

const country1Select = document.getElementById("country1-select");
const country2Select = document.getElementById("country2-select");
const tableCountry1 = document.getElementById("table-country1");
const tableCountry2 = document.getElementById("table-country2");

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

async function loadCountryData() {
    try {
        const response = await fetch(googleSheetUrl);
        const csvText = await response.text();
        const rows = parseCsv(csvText);
        
        rows.slice(1).forEach((row) => {
            const values = row.map(v => v.trim());
            
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
        
        populateCountrySelects();
        document.querySelector(".loading-info").style.display = "none";
    } catch (error) {
        console.error("Fehler beim Laden der Daten:", error);
        document.querySelector(".loading-info").textContent = getUiText("loadError");
    }
}

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

function updateCharts() {
    const c1 = country1Select.value;
    const c2 = country2Select.value;
    
    if (!c1 || !c2) return;
    
    const data1 = countryData[c1];
    const data2 = countryData[c2];
    
    updateTableComparison(data1, data2, c1, c2);
    updateBarChart(data1, data2, c1, c2);
}

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
                        data1.participantCount / 10
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
                        data1.participantCount / 10
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

country1Select.addEventListener("change", updateCharts);
country2Select.addEventListener("change", updateCharts);

window.addEventListener("floorball-language-change", () => {
    updateCharts();
});

loadCountryData();
