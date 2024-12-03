<?php
require_once 'config.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>PTMosaic Laundry Tracker</title>
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <link rel="stylesheet" href="styles.css">
</head>
<body class="min-h-screen bg-gray-100">
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-center mb-8">
             
            <h2 class="text-3xl font-bold">PTMosaic Laundry Tracker</h2>
        </div>

        <div class="space-y-8">
            <?php include 'laundry_form.php'; ?>
            <?php include 'laundry_table.php'; ?>
        </div>
    </div>

    <script>
        lucide.createIcons();
        
        // Initialize date pickers with specific format
        flatpickr(".date-picker", {
            dateFormat: "d/m/Y",
            allowInput: true
        });

        // Auto-refresh table every 30 seconds
        setInterval(() => {
            fetch('get_orders.php')
                .then(response => response.text())
                .then(html => {
                    document.getElementById('orders-table').innerHTML = html;
                    // Reinitialize date pickers after table refresh
                    flatpickr(".date-picker", {
                        dateFormat: "d/m/Y",
                        allowInput: true
                    });
                });
        }, 30000);
    </script>
</body>
</html>