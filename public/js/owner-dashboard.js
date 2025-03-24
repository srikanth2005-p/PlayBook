// Check for authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/owner-login.html';
    }
    return token;
}

// Fetch owner data
async function fetchOwnerData() {
    const token = checkAuth();
    try {
        const response = await fetch('/api/owner-profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch owner data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching owner data:', error);
        return null;
    }
}

// Fetch owner's venues
async function fetchVenues() {
    const token = checkAuth();
    try {
        const response = await fetch('/api/venues', {
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
        console.error('Error fetching venues:', error);
        return [];
    }
}

// Fetch venue bookings
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

// Update dashboard stats
function updateStats(venues, bookings) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayBookings = bookings.filter(b => {
        const bookingDate = new Date(b.startTime);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate.getTime() === today.getTime();
    });

    const activeVenues = venues.filter(v => v.status === 'active');
    const totalRevenue = bookings.reduce((total, booking) => total + booking.totalPrice, 0);
    const averageRating = venues.reduce((total, venue) => total + venue.rating, 0) / venues.length;

    document.getElementById('todayBookingsCount').textContent = todayBookings.length;
    document.getElementById('activeVenuesCount').textContent = activeVenues.length;
    document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toFixed(2)}`;
    document.getElementById('averageRating').textContent = `${averageRating.toFixed(1)} ⭐`;
}

// Update venues table
function updateVenuesTable(venues) {
    const tableBody = document.getElementById('venuesTable');
    tableBody.innerHTML = '';

    venues.forEach(venue => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${venue.name}</td>
            <td>${venue.type}</td>
            <td>${venue.address.city}</td>
            <td><span class="badge status-${venue.status.toLowerCase()}">${venue.status}</span></td>
            <td>${venue.todayBookings || 0}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editVenue('${venue._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-info" onclick="viewVenueDetails('${venue._id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteVenue('${venue._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Add new venue
async function addVenue(formData) {
    const token = checkAuth();
    try {
        const response = await fetch('/api/venues', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        const data = await response.json();
        if (data.success) {
            alert('Venue added successfully');
            location.reload();
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error adding venue:', error);
        alert('Failed to add venue');
    }
}

// Edit venue
async function editVenue(venueId) {
    const token = checkAuth();
    try {
        const response = await fetch(`/api/venues/${venueId}`);
        const data = await response.json();
        if (data.success) {
            const venue = data.data;
            // Populate form with venue data
            document.getElementById('venueName').value = venue.name;
            document.getElementById('venueType').value = venue.type;
            document.getElementById('venueSports').value = venue.sports.join(', ');
            document.getElementById('venueAddress').value = venue.address;
            document.getElementById('venuePrice').value = venue.pricing.basePrice;
            document.getElementById('venueFacilities').value = venue.facilities.join(', ');

            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('addVenueModal'));
            modal.show();

            // Update save button handler
            document.getElementById('saveVenue').onclick = async () => {
                const updatedVenue = {
                    name: document.getElementById('venueName').value,
                    type: document.getElementById('venueType').value,
                    sports: document.getElementById('venueSports').value.split(',').map(s => s.trim()),
                    address: document.getElementById('venueAddress').value,
                    pricing: {
                        basePrice: document.getElementById('venuePrice').value,
                        currency: document.getElementById('venueCurrency').value
                    },
                    facilities: document.getElementById('venueFacilities').value.split(',').map(f => f.trim())
                };

                try {
                    const response = await fetch(`/api/venues/${venueId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(updatedVenue)
                    });
                    const data = await response.json();
                    if (data.success) {
                        alert('Venue updated successfully');
                        modal.hide();
                        location.reload();
                    } else {
                        throw new Error(data.error);
                    }
                } catch (error) {
                    console.error('Error updating venue:', error);
                    alert('Failed to update venue');
                }
            };
        }
    } catch (error) {
        console.error('Error fetching venue details:', error);
        alert('Failed to fetch venue details');
    }
}

// Delete venue
async function deleteVenue(venueId) {
    const token = checkAuth();
    if (confirm('Are you sure you want to delete this venue?')) {
        try {
            const response = await fetch(`/api/venues/${venueId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                alert('Venue deleted successfully');
                location.reload();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error deleting venue:', error);
            alert('Failed to delete venue');
        }
    }
}

// Handle logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/owner-signout', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            localStorage.removeItem('token');
            window.location.href = '/owner-login.html';
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
    window.location.href = '/owner-profile';
});

// Initialize dashboard
async function initializeDashboard() {
    const ownerData = await fetchOwnerData();
    if (ownerData) {
        document.getElementById('ownerName').textContent = ownerData.name;
        document.getElementById('welcomeOwnerName').textContent = ownerData.name;
    }

    const venues = await fetchVenues();
    const bookings = await fetchBookings();
    updateStats(venues, bookings);
    updateVenuesTable(venues);
}

// Handle new venue form submission
document.getElementById('addVenueForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = {
        name: document.getElementById('venueName').value,
        type: document.getElementById('venueType').value,
        sports: document.getElementById('venueSports').value.split(',').map(s => s.trim()),
        address: document.getElementById('venueAddress').value,
        pricing: {
            basePrice: document.getElementById('venuePrice').value,
            currency: document.getElementById('venueCurrency').value
        },
        facilities: document.getElementById('venueFacilities').value.split(',').map(f => f.trim())
    };
    addVenue(formData);
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeDashboard);
