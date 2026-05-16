const API_BASE =
    "https://mobile-analytics-backend-1.onrender.com";

const socket = io(API_BASE);

// =====================================
// STATE
// =====================================

let allEvents = [];

let selectedUser = "ALL";

let selectedTimeFilter = "1h";

let customStart = null;

let customEnd = null;


// =====================================
// ELEMENTS
// =====================================

const statusDiv =
    document.getElementById("status");

const totalEventsElement =
    document.getElementById("totalEvents");

const activeUsersElement =
    document.getElementById("activeUsers");

const topAppElement =
    document.getElementById("topApp");

const activeUsersList =
    document.getElementById("activeUsersList");

const idleUsersList =
    document.getElementById("idleUsersList");

const tableBody =
    document.getElementById("eventsTableBody");

const liveClock =
    document.getElementById("liveClock");

const userFilter =
    document.getElementById("userFilter");

const customControls =
    document.getElementById("customControls");

const startDate =
    document.getElementById("startDate");

const endDate =
    document.getElementById("endDate");


// =====================================
// LIVE CLOCK
// =====================================

setInterval(() => {

    liveClock.innerText =
        new Date().toLocaleTimeString();

}, 1000);


// =====================================
// SOCKET STATUS
// =====================================

socket.on("connect", () => {

    statusDiv.innerText = "Online";

    statusDiv.classList.remove("offline");

    statusDiv.classList.add("online");
});

socket.on("disconnect", () => {

    statusDiv.innerText = "Offline";

    statusDiv.classList.remove("online");

    statusDiv.classList.add("offline");
});


// =====================================
// LIVE EVENTS
// =====================================

socket.on("new_phone_event", (data) => {

    allEvents.push(data);

    renderDashboard();
});


// =====================================
// CHART
// =====================================

const ctx =
    document.getElementById("appsChart");

const appsChart =
    new Chart(ctx, {

        type: "bar",

        data: {

            labels: [],

            datasets: [{

                label: "Top Apps",

                data: []
            }]
        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    labels: {
                        color: "white"
                    }
                }
            },

            scales: {

                x: {

                    ticks: {
                        color: "white"
                    }
                },

                y: {

                    ticks: {
                        color: "white"
                    }
                }
            }
        }
    });


// =====================================
// FILTER EVENTS
// =====================================

function getFilteredEvents() {

    let filtered = [...allEvents];

    // USER FILTER

    if (selectedUser !== "ALL") {

        filtered = filtered.filter(
            event =>
                event.user_name === selectedUser
        );
    }

    // TIME FILTER

    const now = new Date();

    if (selectedTimeFilter === "5m") {

        filtered = filtered.filter(event => {

            const eventTime =
                new Date(event.timestamp);

            return (
                now - eventTime
                <= 5 * 60 * 1000
            );
        });
    }

    else if (selectedTimeFilter === "1h") {

        filtered = filtered.filter(event => {

            const eventTime =
                new Date(event.timestamp);

            return (
                now - eventTime
                <= 60 * 60 * 1000
            );
        });
    }

    else if (selectedTimeFilter === "24h") {

        filtered = filtered.filter(event => {

            const eventTime =
                new Date(event.timestamp);

            return (
                now - eventTime
                <= 24 * 60 * 60 * 1000
            );
        });
    }

    else if (
        selectedTimeFilter === "custom"
        && customStart
        && customEnd
    ) {

        filtered = filtered.filter(event => {

            const eventTime =
                new Date(event.timestamp);

            return (
                eventTime >= customStart
                &&
                eventTime <= customEnd
            );
        });
    }

    return filtered;
}


// =====================================
// RENDER DASHBOARD
// =====================================

function renderDashboard() {

    const filteredEvents =
        getFilteredEvents();

    renderStats(filteredEvents);

    renderTable(filteredEvents);

    renderUsers(filteredEvents);

    renderChart(filteredEvents);

    populateUserFilter();
}


// =====================================
// STATS
// =====================================

function renderStats(events) {

    totalEventsElement.innerText =
        events.length;

    const activeUsers =
        new Set();

    const topApps = {};

    events.forEach(event => {

        if (
            event.app_name !== "Idle"
        ) {

            activeUsers.add(
                event.user_name
            );
        }

        if (
            !topApps[event.app_name]
        ) {

            topApps[event.app_name] = 0;
        }

        topApps[event.app_name]++;
    });

    activeUsersElement.innerText =
        activeUsers.size;

    let topApp = "---";

    let maxCount = 0;

    for (const app in topApps) {

        if (
            topApps[app] > maxCount
        ) {

            maxCount =
                topApps[app];

            topApp = app;
        }
    }

    topAppElement.innerText =
        topApp;
}


// =====================================
// USERS
// =====================================

function renderUsers(events) {

    activeUsersList.innerHTML = "";

    idleUsersList.innerHTML = "";

    const latestUserActivity = {};

    events.forEach(event => {

        latestUserActivity[
            event.user_name
        ] = event;
    });

    for (const user in latestUserActivity) {

        const event =
            latestUserActivity[user];

        const secondsAgo =
            Math.floor(
                (
                    new Date()
                    -
                    new Date(event.timestamp)
                ) / 1000
            );

        const li =
            document.createElement("li");

        li.innerHTML = `
            <strong>${user}</strong>
            <br>
            ${event.app_name}
            <br>
            <span class="last-seen">
                Last seen:
                ${secondsAgo}s ago
            </span>
        `;

        if (
            event.app_name === "Idle"
        ) {

            idleUsersList
                .appendChild(li);
        }

        else {

            activeUsersList
                .appendChild(li);
        }
    }
}


// =====================================
// TABLE
// =====================================

function renderTable(events) {

    tableBody.innerHTML = "";

    events
        .slice()
        .reverse()
        .slice(0, 30)
        .forEach(event => {

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td>${event.user_name}</td>
                <td>${event.app_name}</td>
                <td>${event.event_type}</td>
                <td>${event.duration_seconds || 0}s</td>
                <td>${event.screen_state || "---"}</td>
                <td>${new Date(
                    event.timestamp
                ).toLocaleTimeString()}</td>
            `;

            tableBody.appendChild(row);
        });
}


// =====================================
// CHART
// =====================================

function renderChart(events) {

    const appCounts = {};

    events.forEach(event => {

        if (
            event.app_name === "Idle"
        ) return;

        if (
            !appCounts[event.app_name]
        ) {

            appCounts[event.app_name] = 0;
        }

        appCounts[event.app_name]++;
    });

    const sortedApps =
        Object.entries(appCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

    appsChart.data.labels =
        sortedApps.map(item => item[0]);

    appsChart.data.datasets[0].data =
        sortedApps.map(item => item[1]);

    appsChart.update();
}


// =====================================
// FETCH EVENTS
// =====================================

async function fetchEvents() {

    const response =
        await fetch(`${API_BASE}/events`);

    const events =
        await response.json();

    allEvents = events;

    renderDashboard();
}


// =====================================
// USER FILTER
// =====================================

function populateUserFilter() {

    const users =
        [...new Set(
            allEvents.map(
                event => event.user_name
            )
        )];

    userFilter.innerHTML =
        `<option value="ALL">
            All Users
        </option>`;

    users.forEach(user => {

        const option =
            document.createElement("option");

        option.value = user;

        option.innerText = user;

        userFilter.appendChild(option);
    });

    userFilter.value =
        selectedUser;
}

userFilter.addEventListener(
    "change",
    (e) => {

        selectedUser =
            e.target.value;

        renderDashboard();
    }
);


// =====================================
// TIME FILTERS
// =====================================

document.querySelectorAll(
    ".filter-btn"
).forEach(button => {

    button.addEventListener(
        "click",
        () => {

            document
                .querySelectorAll(".filter-btn")
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            button.classList.add("active");

            selectedTimeFilter =
                button.dataset.filter;

            if (
                selectedTimeFilter
                === "custom"
            ) {

                customControls.style.display =
                    "flex";
            }

            else {

                customControls.style.display =
                    "none";
            }

            renderDashboard();
        }
    );
});

document.getElementById(
    "applyCustom"
).addEventListener(
    "click",
    () => {

        customStart =
            new Date(startDate.value);

        customEnd =
            new Date(endDate.value);

        renderDashboard();
    }
);


// =====================================
// INITIAL LOAD
// =====================================

fetchEvents();


// =====================================
// AUTO REFRESH
// =====================================

setInterval(() => {

    fetchEvents();

}, 10000);