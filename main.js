document.addEventListener('DOMContentLoaded', () => {
    // Ambil data dari server
    fetch('/bookings')
        .then((response) => response.json())
        .then((data) => {
            const tableBody = document.querySelector('#booking-table tbody');
            data.forEach((booking) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${booking.id}</td>
                    <td>${booking.first_name}</td>
                    <td>${booking.last_name}</td>
                    <td>${booking.address}</td>
                    <td>${booking.phone}</td>
                    <td>${new Date(booking.created_at).toLocaleString()}</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch((error) => console.error('Gagal mengambil data:', error));
});
