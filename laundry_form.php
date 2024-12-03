<?php
$villas = ['Sunset Palms', 'SkyFall', 'Villa A', 'Villa B', 'Villa C'];
$garment_types = [
    ['label' => 'T-Shirts', 'key' => 'tshirts'],
    ['label' => 'Shirts', 'key' => 'shirts'],
    ['label' => 'Jeans', 'key' => 'jeans'],
    ['label' => 'Trousers', 'key' => 'trousers'],
    ['label' => 'Shorts', 'key' => 'shorts'],
    ['label' => 'UnderWear', 'key' => 'inner_wear'],
    ['label' => 'Socks', 'key' => 'socks'],
    ['label' => "Women's Dresses", 'key' => 'womens_dresses'],
    ['label' => 'Coat/Jacket', 'key' => 'coat_jacket'],
    ['label' => 'Cap/Hat', 'key' => 'cap_hat'],
    ['label' => 'Other', 'key' => 'other']
];
?>

<form id="laundryForm" class="bg-white p-6 rounded-lg shadow-lg">
    <h2 class="text-2xl font-bold mb-6">New Laundry Order</h2>
    
    <div class="form-group">
        <label class="form-label">Choose Villa *</label>
        <div class="flex gap-4 flex-wrap">
            <?php foreach ($villas as $villa): ?>
            <label class="flex items-center gap-2">
                <input type="radio" name="villa_name" value="<?= htmlspecialchars($villa) ?>" required>
                <span><?= htmlspecialchars($villa) ?></span>
            </label>
            <?php endforeach; ?>
        </div>
    </div>

    <div class="form-group">
        <label class="form-label">Guest Name *</label>
        <input type="text" name="guest_name" class="form-input" required>
    </div>

    <div class="form-grid">
        <?php foreach ($garment_types as $type): ?>
        <div class="garment-input-group">
            <label class="form-label"><?= htmlspecialchars($type['label']) ?></label>
            <input type="number" name="<?= $type['key'] ?>" value="0" min="0" class="form-input">
        </div>
        <?php endforeach; ?>
    </div>

    <div class="form-group mt-4">
        <label class="form-label">Total Garments</label>
        <div id="totalGarments" class="text-lg font-semibold">0</div>
    </div>

    <div class="form-group">
        <label class="form-label">Notes</label>
        <textarea name="notes" class="form-textarea" rows="3" 
                  placeholder="Any special instructions or notes..."></textarea>
    </div>

    <button type="submit" class="btn btn-primary w-full">Submit Order</button>
</form>

<script>
document.getElementById('laundryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    
    try {
        const formData = new FormData(e.target);
        
        // Validate form data
        if (!formData.get('villa_name')) {
            throw new Error('Please select a villa');
        }
        if (!formData.get('guest_name')) {
            throw new Error('Please enter guest name');
        }
        
        const response = await fetch('submit_order.php', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'Failed to submit order');
        }
        
        // Send to webhook
        await fetch('https://hook.eu1.make.com/mat2rcuyktcb77g2oz4416f1qszn6rk6', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result.order)
        });
        
        // Show success message
        await Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Order submitted successfully'
        });
        
        // Reset form
        e.target.reset();
        document.getElementById('totalGarments').textContent = '0';
        
        // Refresh orders table
        const tableHtml = await fetch('get_orders.php').then(r => r.text());
        document.getElementById('orders-table').innerHTML = tableHtml;
        
    } catch (error) {
        console.error('Error:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: error.message
        });
    } finally {
        submitButton.disabled = false;
    }
});

// Calculate total garments
const inputs = document.querySelectorAll('input[type="number"]');
inputs.forEach(input => {
    input.addEventListener('input', () => {
        const total = Array.from(inputs).reduce((sum, input) => sum + (parseInt(input.value) || 0), 0);
        document.getElementById('totalGarments').textContent = total;
    });
});
</script>