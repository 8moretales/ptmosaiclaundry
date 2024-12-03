<?php
require_once 'config.php';

// Delete delivered orders older than 48 hours
$stmt = $conn->prepare("
    DELETE FROM laundry_orders 
    WHERE delivered = 1 
    AND delivery_date < DATE_SUB(NOW(), INTERVAL 24 HOUR)
");

$stmt->execute();

// Set up cron job to run this script every hour
// Add to crontab:
// 0 * * * * php /path/to/cleanup.php
?>