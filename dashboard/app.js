const API_BASE =
    "redis://red-d83sjo7aqgkc73a40dh0:6379";

const socket =
    io(API_BASE);


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

const tableBody =
    document.getElementById("eventsTableBody");

const activeUsersList =
    document.getElementById("activeUsersList");

const liveClock =
    document.getElementById("liveClock");


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

    addEventToTable(data);

    fetchStats();

    fetchActiveUsers();
});


// =====================================
// TABLE
// =====================================

function addEventToTable(data) {

    const row =
        document.createElement("tr");

    row.innerHTML = `
        <td>${data.user_name}</td>
        <td>${data.app_name}</td>
        <td>${data.event_type}</td>
        <td>${data.duration_seconds || 0}s</td>
        <td>${new Date().toLocaleTimeString()}</td>
    `;

    tableBody.prepend(row);

    if (tableBody.children.length > 20) {

        tableBody.removeChild(
            tableBody.lastChild
        );
    }
}


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

                label: "App Usage",

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
// FETCH STATS
// =====================================

async function fetchStats() {

    const response =
        await fetch(`${API_BASE}/stats`);

    const stats =
        await response.json();

    totalEventsElement.innerText =
        stats.total_events;

    activeUsersElement.innerText =
        stats.active_users;

    let topApp = "---";

    let maxCount = 0;

    const labels = [];

    const values = [];

    for (const app in stats.top_apps) {

        labels.push(app);

        values.push(
            stats.top_apps[app]
        );

        if (stats.top_apps[app] > maxCount) {

            maxCount =
                stats.top_apps[app];

            topApp = app;
        }
    }

    topAppElement.innerText =
        topApp;

    appsChart.data.labels =
        labels;

    appsChart.data.datasets[0].data =
        values;

    appsChart.update();
}


// =====================================
// ACTIVE USERS
// =====================================

async function fetchActiveUsers() {

    const response =
        await fetch(
            `${API_BASE}/active-users`
        );

    const data =
        await response.json();

    activeUsersList.innerHTML = "";

    for (const user in data.active_users) {

        const app =
            data.active_users[user];

        const li =
            document.createElement("li");

        li.innerHTML = `
            <strong>${user}</strong>
            <br>
            using ${app}
        `;

        activeUsersList.appendChild(li);
    }
}


// =====================================
// FETCH HISTORY
// =====================================

async function fetchEvents() {

    const response =
        await fetch(
            `${API_BASE}/events`
        );

    const events =
        await response.json();

    tableBody.innerHTML = "";

    events.reverse().slice(0, 20)
        .forEach(event => {

            addEventToTable(event);
        });
}


// =====================================
// INITIAL LOAD
// =====================================

fetchStats();

fetchEvents();

fetchActiveUsers();


// =====================================
// AUTO REFRESH
// =====================================

setInterval(() => {

    fetchActiveUsers();

    fetchStats();

}, 5000);