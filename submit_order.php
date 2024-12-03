<?php
// Disable error output in response
ini_set('display_errors', 0);
error_reporting(0);

require_once 'config.php';

header('Content-Type: application/json');

try {
    // Validate input
    if (empty($_POST['villa_name']) || empty($_POST['guest_name'])) {
        throw new Exception('Villa name and guest name are required');
    }

    // Sanitize inputs
    $villa_name = strip_tags(trim($_POST['villa_name']));
    $guest_name = strip_tags(trim($_POST['guest_name']));

    // Get latest order number
    $result = $conn->query("SELECT COALESCE(MAX(order_number), 10000) as max_number FROM laundry_orders");
    if (!$result) {
        throw new Exception($conn->error);
    }
    
    $row = $result->fetch_assoc();
    $newOrderNumber = $row['max_number'] + 1;

    // Calculate total garments
    $garment_fields = ['shirts', 'tshirts', 'jeans', 'trousers', 'shorts', 
                       'inner_wear', 'socks', 'womens_dresses', 'coat_jacket', 
                       'cap_hat', 'other'];
    
    $total_garments = 0;
    $garment_values = [];
    
    foreach ($garment_fields as $field) {
        $value = max(0, intval($_POST[$field] ?? 0));
        $garment_values[$field] = $value;
        $total_garments += $value;
    }

    // Current date in required format
    date_default_timezone_set('Asia/Singapore');
     
    $order_date = date('d/m/Y h:i A');

    // Begin transaction
    $conn->begin_transaction();

    try {
        $sql = "INSERT INTO laundry_orders (
            order_number, villa_name, guest_name, order_date,
            total_garments, shirts, tshirts, jeans, trousers,
            shorts, inner_wear, socks, womens_dresses,
            coat_jacket, cap_hat, other, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception($conn->error);
        }

        $notes = strip_tags(trim($_POST['notes'] ?? ''));
        
        $stmt->bind_param("isssiiiiiiiiiiiss",
            $newOrderNumber,
            $villa_name,
            $guest_name,
            $order_date,
            $total_garments,
            $garment_values['shirts'],
            $garment_values['tshirts'],
            $garment_values['jeans'],
            $garment_values['trousers'],
            $garment_values['shorts'],
            $garment_values['inner_wear'],
            $garment_values['socks'],
            $garment_values['womens_dresses'],
            $garment_values['coat_jacket'],
            $garment_values['cap_hat'],
            $garment_values['other'],
            $notes
        );

        if (!$stmt->execute()) {
            throw new Exception($stmt->error);
        }

        $orderId = $stmt->insert_id;
        $stmt->close();

        // Get inserted order
        $stmt = $conn->prepare("SELECT * FROM laundry_orders WHERE id = ?");
        $stmt->bind_param("i", $orderId);
        $stmt->execute();
        $result = $stmt->get_result();
        $order = $result->fetch_assoc();

        if (!$order) {
            throw new Exception("Failed to retrieve inserted order");
        }

        // Commit transaction
        $conn->commit();

        echo json_encode([
            'success' => true,
            'order' => $order
        ]);

    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }

} catch (Exception $e) {
    error_log("Order submission error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>