document.addEventListener('DOMContentLoaded', function() {
    // Sidebar Toggle
    const toggleSidebarButton = document.getElementById('toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');

    toggleSidebarButton.addEventListener('click', function() {
        sidebar.classList.toggle('sidebar-collapsed');
        mainContent.classList.toggle('main-content-expanded');
        document.querySelectorAll('.menu-text').forEach(text => {
            text.classList.toggle('menu-text-visible');
        });
    });

    // Dropdown User
    const userInfo = document.querySelector('.user-info');
    const dropdownContent = document.querySelector('.dropdown-content');

    userInfo.addEventListener('click', function(event) {
        if (event.target === userInfo || userInfo.contains(event.target)) {
            dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
        }
    });

    document.addEventListener('click', function(event) {
        if (!userInfo.contains(event.target)) {
            dropdownContent.style.display = 'none';
        }
    });

    // Fetch Data from API and Populate Cards
    async function fetchData() {
        try {
            const responseUsers = await fetch('https:/freesexy.net:8080/users/total');
            const dataUsers = await responseUsers.json();
            document.getElementById('total-users').textContent = dataUsers.total;
            document.getElementById('total-users-change').textContent = `${dataUsers.change}% desde último mês`;

            const responseNewUsers = await fetch('https:/freesexy.net:8080/users/today');
            const dataNewUsers = await responseNewUsers.json();
            document.getElementById('new-users-today').textContent = dataNewUsers.today;
            document.getElementById('new-users-today-change').textContent = `${dataNewUsers.change}% desde ontem`;

            const responseMessages = await fetch('https:/freesexy.net:8080/messages/today');
            const dataMessages = await responseMessages.json();
            document.getElementById('messages-today').textContent = dataMessages.today;
            document.getElementById('messages-today-change').textContent = `${dataMessages.change}% desde ontem`;

            const responseSuggestions = await fetch('https:/freesexy.net:8080/suggestions/new');
            const dataSuggestions = await responseSuggestions.json();
            document.getElementById('new-suggestions').textContent = dataSuggestions.new;
            document.getElementById('new-suggestions-change').textContent = `${dataSuggestions.change}% desde ontem`;

            // Fetch data for charts
            const responseGrowth = await fetch('https:/freesexy.net:8080/stats/growth');
            const dataGrowth = await responseGrowth.json();
            renderGrowthChart(dataGrowth);

            const responseProvince = await fetch('https:/freesexy.net:8080/stats/province');
            const dataProvince = await responseProvince.json();
            renderProvinceChart(dataProvince);

            const responseActivity = await fetch('https:/freesexy.net:8080/activity/recent');
            const dataActivity = await responseActivity.json();
            populateRecentActivity(dataActivity);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    fetchData();

    // Render Charts
    function renderGrowthChart(data) {
        const ctx = document.querySelector('.chart-placeholder:nth-child(1)');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Crescimento',
                    data: data.values,
                    borderColor: 'blue',
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    function renderProvinceChart(data) {
        const ctx = document.querySelector('.chart-placeholder:nth-child(2)');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Distribuição',
                    data: data.values,
                    backgroundColor: ['red', 'blue', 'green', 'yellow', 'purple']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // Populate Recent Activity
    function populateRecentActivity(activities) {
        const activityList = document.querySelector('.activity-list');
        activityList.innerHTML = ''; // Clear existing list

        activities.forEach(activity => {
            const listItem = document.createElement('li');
            listItem.className = 'activity-item';
            listItem.innerHTML = `
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-info">
                    <div class="activity-text"><strong>${activity.user}</strong> ${activity.text}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            `;
            activityList.appendChild(listItem);
        });
    }
});


function checkAuth() {
    const token = getAuthToken();
    if (!token) {
        // Redirecionar para a página de login se não estiver autenticado
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

(async function init() {
  checkAuth()
})()