const socket = io("http://localhost:8000");

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


// =====================================
// SOCKET CONNECTION
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
// LIVE EVENT STREAM
// =====================================

socket.on("new_phone_event", (data) => {

    addEventToTable(data);

    fetchStats();

    fetchActiveUsers();
});


// =====================================
// ADD EVENT ROW
// =====================================

function addEventToTable(data) {

    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${data.user_name}</td>
        <td>${data.app_name}</td>
        <td>${data.event_type}</td>
        <td>${new Date().toLocaleTimeString()}</td>
    `;

    tableBody.prepend(row);
}


// =====================================
// FETCH STATS
// =====================================

async function fetchStats() {

    const response = await fetch(
        "http://localhost:8000/stats"
    );

    const stats = await response.json();

    totalEventsElement.innerText =
        stats.total_events;

    activeUsersElement.innerText =
        stats.active_users;

    // Find top app
    let topApp = "---";

    let maxCount = 0;

    for (const app in stats.top_apps) {

        if (stats.top_apps[app] > maxCount) {

            maxCount = stats.top_apps[app];

            topApp = app;
        }
    }

    topAppElement.innerText = topApp;
}


// =====================================
// FETCH ACTIVE USERS
// =====================================

async function fetchActiveUsers() {

    const response = await fetch(
        "http://localhost:8000/active-users"
    );

    const data = await response.json();

    activeUsersList.innerHTML = "";

    for (const user in data.active_users) {

        const app = data.active_users[user];

        const li = document.createElement("li");

        li.innerText =
            `${user} using ${app}`;

        activeUsersList.appendChild(li);
    }
}


// =====================================
// FETCH EVENT HISTORY
// =====================================

async function fetchEvents() {

    const response = await fetch(
        "http://localhost:8000/events"
    );

    const events = await response.json();

    tableBody.innerHTML = "";

    events.slice(0, 20).forEach(event => {

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
// AUTO REFRESH ACTIVE USERS
// =====================================

setInterval(() => {

    fetchActiveUsers();

}, 5000);