let selectedDates = new Set();
let allTableData = []; // Store all table data for filtering

// Move this to the top level of your script
const detailDataMap = {
    1: [
        { id: 1, time: '12:23-12:28', amount: 6 },
        { id: 2, time: '12:23-12:27', amount: 8 },
        { id: 3, time: '12:26-12:36', amount: 10 }
    ],
    2: [
        { id: 1, time: '14:00-14:15', amount: 12 },
        { id: 2, time: '14:20-14:35', amount: 8 },
        { id: 3, time: '14:40-14:55', amount: 15 }
    ],
    3: [
        { id: 1, time: '09:15-09:30', amount: 10 },
        { id: 2, time: '09:45-10:00', amount: 12 },
        { id: 3, time: '10:15-10:30', amount: 8 }
    ],
    4: [
        { id: 1, time: '13:00-13:15', amount: 14 },
        { id: 2, time: '13:30-13:45', amount: 16 },
        { id: 3, time: '14:00-14:15', amount: 10 }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    initializeCalendar();
    initializeTable();
    initializeModal();

    const userDropdown = document.querySelector('.user-dropdown');
    const userButton = document.querySelector('.user-button');

    // Toggle dropdown
    userButton.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!userDropdown.contains(e.target)) {
            userDropdown.classList.remove('active');
        }
    });
});

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function toggleDateSelection(element, dateStr) {
    element.classList.toggle('highlighted');
    
    if (selectedDates.has(dateStr)) {
        selectedDates.delete(dateStr);
    } else {
        selectedDates.add(dateStr);
    }
    
    filterTable();
}

function filterTable() {
    if (selectedDates.size === 0) {
        // If no dates selected, show all data
        renderTableData(allTableData);
        return;
    }

    const filteredData = allTableData.filter(item => {
        // Convert start and end dates to Date objects
        const startDate = item.start.split(' ')[0];
        const endDate = item.end.split(' ')[0];
        
        // Check if any selected date falls within the range
        for (let dateStr of selectedDates) {
            if (dateStr >= startDate && dateStr <= endDate) {
                return true;
            }
        }
        return false;
    });

    renderTableData(filteredData);
}

function createDetailView(id) {
    const mainContent = document.querySelector('.main-content');
    
    // Store the current table view HTML to restore it later
    const previousContent = mainContent.innerHTML;
    
    // Update sidebar stats
    updateSidebarStats(id);
    
    // Create the detail view
    mainContent.innerHTML = `
        <div class="detail-view">
            <div class="detail-header">
                <button class="back-btn"><i class="fas fa-arrow-left"></i> Grįžti</button>
                <h2>${id}. ${getDateRangeForId(id)}</h2>
            </div>
            <table class="details-table">
                <thead>
                    <tr>
                        <th>ID <i class="fas fa-sort-up"></i></th>
                        <th>Pakėlimo-Nuleidimo laikas <i class="fas fa-sort-up"></i></th>
                        <th>Kiekis <i class="fas fa-sort-up"></i></th>
                        <th>Peržiūra ir redagavimas</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateDetailRows(id)}
                </tbody>
            </table>
        </div>
    `;

    // Add back button functionality
    const backBtn = mainContent.querySelector('.back-btn');
    backBtn.addEventListener('click', () => {
        mainContent.innerHTML = previousContent;
        // Restore the "Pridėti krovą" button
        restoreSidebarButton();
        // Reattach event listeners to the restored view
        attachTableEventListeners();
    });
}

function getDateRangeForId(id) {
    // Find the corresponding data from allTableData
    const data = allTableData.find(item => item.id === parseInt(id));
    if (data) {
        const [startDate, startTime] = data.start.split(' ');
        const [endDate, endTime] = data.end.split(' ');
        return `${startDate} / ${startTime} -${endDate} / ${endTime}`;
    }
    return '';
}

function generateDetailRows(id) {
    const detailData = detailDataMap[id] || [];

    return detailData.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>${item.time}</td>
            <td>${item.amount}</td>
            <td>
                <button class="select-btn">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderTableData(data) {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = ''; // Clear existing rows
    
    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.start}</td>
            <td>${item.end}</td>
            <td><button class="select-btn" data-id="${item.id}">Pasirinkti</button></td>
        `;
        tbody.appendChild(row);
    });

    attachTableEventListeners();
}

function attachTableEventListeners() {
    const selectBtns = document.querySelectorAll('.select-btn');
    selectBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.hasAttribute('data-id')) {
                // This is a main table "Pasirinkti" button
                const id = btn.getAttribute('data-id');
                createDetailView(id);
            } else {
                // This is a detail view edit button
                // Handle edit functionality here if needed
            }
        });
    });
}

function initializeCalendar() {
    const weekdaysContainer = document.querySelector('.weekdays');
    const daysContainer = document.querySelector('.days');
    const monthYearDisplay = document.querySelector('.calendar-header h2');
    const prevBtn = document.querySelector('.nav-btn:first-child');
    const nextBtn = document.querySelector('.nav-btn:last-child');
    
    const weekdays = ['P', 'A', 'T', 'K', 'Pn', 'Š', 'S'];
    let currentDate = new Date();
    let displayedDate = new Date();

    // Add weekdays
    weekdays.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        weekdaysContainer.appendChild(dayElement);
    });

    function updateCalendar() {
        // Clear previous days
        daysContainer.innerHTML = '';

        // Update month and year display
        const months = ['Sausis', 'Vasaris', 'Kovas', 'Balandis', 'Gegužė', 'Birželis', 
                       'Liepa', 'Rugpjūtis', 'Rugsėjis', 'Spalis', 'Lapkritis', 'Gruodis'];
        monthYearDisplay.textContent = `${months[displayedDate.getMonth()]} ${displayedDate.getFullYear()}`;

        // Get first day of month and total days
        const firstDay = new Date(displayedDate.getFullYear(), displayedDate.getMonth(), 1);
        const lastDay = new Date(displayedDate.getFullYear(), displayedDate.getMonth() + 1, 0);
        
        // Add empty cells for days before first day of month
        let firstDayIndex = firstDay.getDay() || 7; // Convert Sunday (0) to 7
        firstDayIndex--; // Adjust for Monday start
        for (let i = 0; i < firstDayIndex; i++) {
            const emptyDay = document.createElement('div');
            daysContainer.appendChild(emptyDay);
        }

        // Add days of month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const dayElement = document.createElement('div');
            dayElement.textContent = i;
            dayElement.classList.add('selectable');

            // Check if this date is selected
            const currentDateStr = formatDate(new Date(displayedDate.getFullYear(), displayedDate.getMonth(), i));
            if (selectedDates.has(currentDateStr)) {
                dayElement.classList.add('highlighted');
            }

            // Check if this is the current date
            const today = new Date();
            const currentDay = today.getDate();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();

            if (i === currentDay && 
                currentMonth === new Date().getMonth() && 
                currentYear === new Date().getFullYear()) {
                dayElement.classList.add('current-day');
            }

            dayElement.addEventListener('click', () => {
                const dateStr = formatDate(new Date(displayedDate.getFullYear(), displayedDate.getMonth(), i));
                toggleDateSelection(dayElement, dateStr);
            });
            daysContainer.appendChild(dayElement);
        }
    }

    // Navigation event listeners
    prevBtn.addEventListener('click', () => {
        displayedDate.setMonth(displayedDate.getMonth() - 1);
        updateCalendar();
    });

    nextBtn.addEventListener('click', () => {
        displayedDate.setMonth(displayedDate.getMonth() + 1);
        updateCalendar();
    });

    // Initial calendar render
    updateCalendar();
}

function initializeTable() {
    const data = [
        {
            id: 1,
            start: '2024-01-12 12:23',
            end: '2024-01-13 19:21'
        },
        {
            id: 2,
            start: '2024-01-13 14:00',
            end: '2024-01-14 16:30'
        },
        {
            id: 3,
            start: '2024-01-14 09:15',
            end: '2024-01-15 11:45'
        },
        {
            id: 4,
            start: '2024-01-15 13:00',
            end: '2024-01-16 15:30'
        }
    ];
    
    // Store the data globally
    allTableData = data;
    
    // Initial render of all data
    renderTableData(data);
}

function initializeModal() {
    const modal = document.getElementById('addLoadModal');
    const addLoadBtn = document.querySelector('.add-load');
    const closeBtn = document.querySelector('.close-modal');
    const cancelBtn = document.querySelector('.cancel-btn');
    const form = document.getElementById('loadFilterForm');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    let currentId = 4; // Starting from the last ID in our initial data

    function showMessage(element, duration = 3000) {
        element.classList.add('show-message');
        setTimeout(() => {
            element.classList.remove('show-message');
        }, duration);
    }

    // Open modal
    addLoadBtn.addEventListener('click', () => {
        modal.classList.add('show');
        // Hide any existing messages
        successMessage.classList.remove('show-message');
        errorMessage.classList.remove('show-message');
    });

    // Close modal functions
    function closeModal() {
        modal.classList.remove('show');
        form.reset();
    }

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const startDate = document.getElementById('startDate').value;
        const startTime = document.getElementById('startTime').value;
        const endDate = document.getElementById('endDate').value;
        const endTime = document.getElementById('endTime').value;

        const newData = {
            id: ++currentId,
            start: `${startDate} ${startTime}`,
            end: `${endDate} ${endTime}`
        };

        try {
            // Add to global data
            allTableData.push(newData);
            
            // Filter and update table
            filterTable();
            
            // Show success message
            showMessage(successMessage);
            
            // Close the modal after a delay
            setTimeout(closeModal, 1000);
            
        } catch (error) {
            console.error('Error applying filter:', error);
            showMessage(errorMessage);
        }
    });
} 

function updateSidebarStats(id) {
    const addLoadButton = document.querySelector('.add-load');
    if (addLoadButton) {
        const detailData = detailDataMap[id] || [];
        const totalRecords = detailData.length;
        const totalAmount = detailData.reduce((sum, item) => sum + item.amount, 0);
        
        const statsHtml = `
            <div class="stats-container">
                <div class="stat-item">
                    <div class="stat-info">
                        <span class="stat-label">Viso įrašų</span>
                        <span class="stat-value">${totalRecords}</span>
                    </div>
                    <div class="stat-icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                </div>
                <div class="stat-item">
                    <div class="stat-info">
                        <span class="stat-label">Visas kiekis</span>
                        <span class="stat-value">${totalAmount}</span>
                    </div>
                    <div class="stat-icon">
                        <i class="fas fa-box"></i>
                    </div>
                </div>
            </div>`;
        
        addLoadButton.outerHTML = statsHtml;
    }
}

function restoreSidebarButton() {
    const statsContainer = document.querySelector('.stats-container');
    if (statsContainer) {
        statsContainer.outerHTML = '<button class="add-load">Pridėti krova</button>';
        // Reattach modal event listener if needed
        initializeModal();
    }
} 