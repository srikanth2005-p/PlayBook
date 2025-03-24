// Check for authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
    }
    return token;
}

// Fetch user data
async function fetchUserData() {
    const token = checkAuth();
    try {
        const response = await fetch('/api/user-profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

// Fetch user's bookings
async function fetchBookings() {
    const token = checkAuth();
    try {
        const response = await fetch('/api/bookings', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (data.success) {
            return data.data;
        }
        throw new Error(data.error);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return [];
    }
}

// Format date and time
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
}

// Update dashboard stats
function updateStats(bookings) {
    const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
    const completedBookings = bookings.filter(b => b.status === 'completed');
    const totalSpent = bookings.reduce((total, booking) => total + booking.totalPrice, 0);

    document.getElementById('activeBookingsCount').textContent = activeBookings.length;
    document.getElementById('completedBookingsCount').textContent = completedBookings.length;
    document.getElementById('totalSpent').textContent = `₹${totalSpent.toFixed(2)}`;
}

// Update recent bookings table
function updateRecentBookings(bookings) {
    const tableBody = document.getElementById('recentBookingsTable');
    tableBody.innerHTML = '';

    bookings.slice(0, 5).forEach(booking => {
        const { date, time } = formatDateTime(booking.startTime);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${booking.venue.name}</td>
            <td>${date}</td>
            <td>${time}</td>
            <td><span class="badge status-${booking.status.toLowerCase()}">${booking.status}</span></td>
            <td>₹${booking.totalPrice.toFixed(2)}</td>
            <td>
                ${booking.status === 'pending' || booking.status === 'confirmed' ? `
                    <button class="btn btn-sm btn-danger" onclick="cancelBooking('${booking._id}')">
                        Cancel
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-primary" onclick="viewBookingDetails('${booking._id}')">
                    View
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Cancel booking
async function cancelBooking(bookingId) {
    const token = checkAuth();
    if (confirm('Are you sure you want to cancel this booking?')) {
        try {
            const response = await fetch(`/api/bookings/${bookingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                alert('Booking cancelled successfully');
                location.reload();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('Failed to cancel booking');
        }
    }
}

// View booking details
function viewBookingDetails(bookingId) {
    // TODO: Implement booking details view
    console.log('View booking:', bookingId);
}

// Book venue
async function bookVenue(venueId) {
    const token = checkAuth();
    const modal = new bootstrap.Modal(document.getElementById('bookingModal'));
    
    // Populate time slots based on venue availability
    const timeSelect = document.getElementById('bookingTime');
    timeSelect.innerHTML = '';
    
    // Add time slots (example)
    for (let hour = 6; hour <= 22; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        timeSelect.appendChild(option);
    }

    modal.show();

    // Handle booking confirmation
    document.getElementById('confirmBooking').onclick = async () => {
        const date = document.getElementById('bookingDate').value;
        const time = document.getElementById('bookingTime').value;
        const duration = document.getElementById('bookingDuration').value;

        if (!date || !time || !duration) {
            alert('Please fill all fields');
            return;
        }

        const startTime = new Date(`${date} ${time}`);
        const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    venue: venueId,
                    startTime,
                    endTime
                })
            });

            const data = await response.json();
            if (data.success) {
                alert('Booking created successfully');
                modal.hide();
                location.reload();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error creating booking:', error);
            alert('Failed to create booking');
        }
    };
}

// Initialize dashboard
async function initializeDashboard() {
    const user = await fetchUserData();
    if (user) {
        document.getElementById('userName').textContent = user.firstName;
        document.getElementById('welcomeUserName').textContent = user.firstName;
    }

    const bookings = await fetchBookings();
    updateStats(bookings);
    updateRecentBookings(bookings);
}

// Dashboard functionality
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        // Fetch user profile
        const response = await fetch('/api/user-profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (data.success) {
            // Update user name
            document.getElementById('userName').textContent = data.data.firstName;
            
            // Update stats (this would be replaced with real data)
            updateStats({
                bookingsToday: 0,
                activeUsers: 0,
                todayRevenue: 0,
                averageRating: 0
            });
            
            // Load recent bookings (this would be replaced with real data)
            loadRecentBookings([]);
            
        } else {
            console.error('Failed to load profile:', data.error);
            alert('Failed to load profile. Please try logging in again.');
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        alert('An error occurred while loading the dashboard');
    }
});

// Update dashboard stats
function updateStats(stats) {
    const statElements = document.querySelectorAll('.stat-number');
    statElements[0].textContent = stats.bookingsToday;
    statElements[1].textContent = stats.activeUsers;
    statElements[2].textContent = `₹${stats.todayRevenue}`;
    statElements[3].textContent = stats.averageRating.toFixed(1);
}

// Load recent bookings
function loadRecentBookings(bookings) {
    const tbody = document.getElementById('recentBookings');
    
    if (!bookings || bookings.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">No recent bookings</td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = bookings.map(booking => `
        <tr>
            <td>${booking.id}</td>
            <td>${booking.user}</td>
            <td>${booking.venue}</td>
            <td>${booking.date}</td>
            <td>${booking.time}</td>
            <td>${booking.status}</td>
            <td>
                <button class="action-btn">View</button>
            </td>
        </tr>
    `).join('');
}

// Handle logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/user-signout', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            localStorage.removeItem('token');
            window.location.href = '/login.html';
        } else {
            console.error('Logout failed');
        }
    } catch (error) {
        console.error('Error during logout:', error);
    }
});

// Handle profile link
document.querySelector('a[href="#profile"]').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/user-profile';
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeDashboard);
