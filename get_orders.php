<?php
require_once 'config.php';

$query = "SELECT * FROM laundry_orders ORDER BY delivered ASC, order_number DESC";
$result = $conn->query($query);
?>

<table class="table">
    <thead>
        <tr>
            <th>Delivered</th>
            <th>Delivery Date</th>
            <th>Order Date</th>
            <th>Villa</th>
            <th>Guest</th>
            <th>Total Items</th>
            <th>Order Notes</th>
            <th>Order #</th>
        </tr>
    </thead>
    <tbody>
        <?php while ($order = $result->fetch_assoc()): ?>
        <tr class="<?= $order['delivered'] ? 'delivered' : '' ?>">
            <td class="text-center">
                <input type="checkbox" 
                       <?= $order['delivered'] ? 'checked' : '' ?>
                       onchange="validateAndUpdateDelivery(this, <?= $order['id'] ?>)"
                       class="delivery-checkbox">
            </td>
            <td>
                <input type="text" 
                       class="form-input date-picker" 
                       value="<?= $order['delivery_date'] ? date('d/m/Y', strtotime($order['delivery_date'])) : '' ?>"
                       data-order-id="<?= $order['id'] ?>"
                       required>
            </td>
            <td><?= htmlspecialchars($order['order_date']) ?></td>
            <td><?= htmlspecialchars($order['villa_name']) ?></td>
            <td><?= htmlspecialchars($order['guest_name']) ?></td>
            <td><?= htmlspecialchars($order['total_garments']) ?></td>
            <td class="max-w-[200px] whitespace-normal">
                <?= nl2br(htmlspecialchars($order['notes'])) ?>
            </td>
            <td><?= htmlspecialchars($order['order_number']) ?></td>
        </tr>
        <?php endwhile; ?>
    </tbody>
</table>

<script>
flatpickr(".date-picker", {
    dateFormat: "d/m/Y",
    allowInput: true,
    onChange: function(selectedDates, dateStr, instance) {
        const input = instance.input;
        updateDeliveryDate(input);
    }
});

async function validateAndUpdateDelivery(checkbox, orderId) {
    const row = checkbox.closest('tr');
    const datePicker = row.querySelector('.date-picker');
    
    if (checkbox.checked && !datePicker.value) {
        checkbox.checked = false;
        await Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Please set a delivery date before marking as delivered'
        });
        return;
    }
    
    updateDeliveryStatus(checkbox, orderId);
}

async function updateDeliveryDate(input) {
    const orderId = input.dataset.orderId;
    const date = input.value;
    
    try {
        const response = await fetch('update_order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=date&id=${orderId}&date=${encodeURIComponent(date)}`
        });
        
        if (!response.ok) throw new Error('Failed to update delivery date');
        
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: error.message
        });
    }
}

async function updateDeliveryStatus(checkbox, orderId) {
    try {
        const response = await fetch('update_order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=status&id=${orderId}&delivered=${checkbox.checked ? 1 : 0}`
        });
        
        if (!response.ok) throw new Error('Failed to update delivery status');
        
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        
        // Send webhook if marked as delivered
        if (checkbox.checked) {
            await fetch('https://hook.eu1.make.com/1bkuivimuxrrkveycih7kqsu35atdomg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    delivery_date: result.order.delivery_date,
                    villa_name: result.order.villa_name,
                    guest_name: result.order.guest_name,
                    total_garments: result.order.total_garments
                })
            });
        }
        
        // Update row color
        checkbox.closest('tr').classList.toggle('delivered', checkbox.checked);
        
    } catch (error) {
        checkbox.checked = !checkbox.checked; // Revert checkbox state
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: error.message
        });
    }
}
</script></content></file>
</boltArtifact>
