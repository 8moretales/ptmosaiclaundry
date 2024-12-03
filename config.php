<?php
// Disable error output
ini_set('display_errors', 0);
error_reporting(0);

// Log errors instead of displaying them
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'kntgfkmy_laundtrack2024');
define('DB_PASS', '@*dPo@+c5@PQ');
define('DB_NAME', 'kntgfkmy_laundrytracker');

// Create connection with error handling
try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Set charset to utf8mb4
    if (!$conn->set_charset("utf8mb4")) {
        throw new Exception("Error loading character set utf8mb4: " . $conn->error);
    }
    
    // Set timezone
     
    
} catch (Exception $e) {
    error_log("Database connection error: " . $e->getMessage());
    header('Content-Type: application/json');
    http_response_code(500);
    die(json_encode([
        'success' => false,
        'message' => 'Database connection error'
    ]));
}
?>