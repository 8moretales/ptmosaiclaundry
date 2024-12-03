<?php
require_once 'config.php';

header('Content-Type: application/json');

try {
    $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
    $action = filter_input(INPUT_POST, 'action', FILTER_SANITIZE_STRING);
    
    if (!$id || !$action) {
        throw new Exception('Missing required parameters');
    }
    
    $conn->begin_transaction();
    
    try {
        switch ($action) {
            case 'date':
                $date = filter_input(INPUT_POST, 'date', FILTER_SANITIZE_STRING);
                if (!$date) throw new Exception('Missing date parameter');
                
                // Convert date from d/m/Y to MySQL format
                $formatted_date = DateTime::createFromFormat('d/m/Y', $date);
                if (!$formatted_date) {
                    throw new Exception('Invalid date format');
                }
                $mysql_date = $formatted_date->format('Y-m-d');
                
                $stmt = $conn->prepare("
                    UPDATE laundry_orders 
                    SET delivery_date = ?
                    WHERE id = ?
                ");
                if (!$stmt) throw new Exception($conn->error);
                $stmt->bind_param("si", $mysql_date, $id);
                break;
                
            case 'status':
                $delivered = filter_input(INPUT_POST, 'delivered', FILTER_VALIDATE_INT);
                if ($delivered === null) throw new Exception('Missing delivered parameter');
                
                $delivery_date = $delivered ? date('Y-m-d') : null;
                
                $stmt = $conn->prepare("
                    UPDATE laundry_orders 
                    SET delivered = ?,
                        delivery_date = ?
                    WHERE id = ?
                ");
                if (!$stmt) throw new Exception($conn->error);
                $stmt->bind_param("isi", $delivered, $delivery_date, $id);
                break;
                
            case 'delivery_notes':
                $notes = filter_input(INPUT_POST, 'notes', FILTER_SANITIZE_STRING) ?? '';
                
                $stmt = $conn->prepare("
                    UPDATE laundry_orders 
                    SET delivery_notes = ?
                    WHERE id = ?
                ");
                if (!$stmt) throw new Exception($conn->error);
                $stmt->bind_param("si", $notes, $id);
                break;
                
            default:
                throw new Exception('Invalid action');
        }
        
        if (!$stmt->execute()) {
            throw new Exception($stmt->error);
        }
        
        // Get updated order for webhook
        $stmt = $conn->prepare("SELECT * FROM laundry_orders WHERE id = ?");
        if (!$stmt) throw new Exception($conn->error);
        $stmt->bind_param("i", $id);
        
        if (!$stmt->execute()) {
            throw new Exception($stmt->error);
        }
        
        $result = $stmt->get_result();
        $order = $result->fetch_assoc();
        
        if (!$order) {
            throw new Exception('Failed to retrieve updated order');
        }
        
        // Format delivery_date for display if it exists
        if ($order['delivery_date']) {
            $order['delivery_date'] = date('d/m/Y', strtotime($order['delivery_date']));
        }
        
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
    error_log("Order update error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>