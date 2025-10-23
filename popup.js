document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('copyButton').addEventListener('click', copyText);
    document.getElementById('field1').addEventListener('change', handleField1Change);
    handleField1Change(); // Khởi tạo trạng thái khi tải trang
    setupShippingFeeInput();
});

function handleField1Change() {
    const field1 = document.getElementById('field1').value;
    const isKWM = (field1 === 'KWM');
    
    const field2 = document.getElementById('field2');
    const field3 = document.getElementById('field3');

    if (isKWM) {
        field2.disabled = false;
        field3.disabled = false;
    } else {
        field2.disabled = true;
        field3.disabled = true;
        field2.value = "";
        field3.value = "";
    }
}

function copyText() {
    const field1 = document.getElementById('field1').value;
    const field2 = document.getElementById('field2').value;
    const field3 = document.getElementById('field3').value;
    const note = document.getElementById('note').value;
    const deliveryMethod = document.getElementById('deliveryMethod').value;
    const vatOption = document.getElementById('vatOption').value;
    const shippingFeeInput = document.getElementById('shippingFee');
    const shippingFeeValue = shippingFeeInput ? shippingFeeInput.value.trim() : '';

    if (field1 === 'KWM' && (!field2 || !field3)) {
        alert('Vui lòng chọn đầy đủ Nguồn Khách và Kênh Tương Tác khi chọn KWM!');
        return;
    }

    if (!deliveryMethod) {
        alert('Vui lòng chọn Hình thức giao!');
        return;
    }

    if (!vatOption) {
        alert('Vui lòng chọn VAT!');
        return;
    }

    let textToCopy = field1;

    if (field1 === 'KWM') {
        textToCopy += ` - ${field2} - ${field3}`;
    }

    if (deliveryMethod) {
        textToCopy += ` | ${deliveryMethod}`;
    }

    if (vatOption) {
        textToCopy += ` | ${vatOption}`;
    }

    const formattedShippingFee = formatShippingFeeForCopy(shippingFeeValue);
    if (formattedShippingFee) {
        textToCopy += ` | Cước xe: ${formattedShippingFee}`;
    }

    // Thêm ghi chú nếu có
    if (note) {
        textToCopy += ` | ${note}`;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Đã sao chép: ' + textToCopy);
    }).catch(err => {
        console.error('Không thể sao chép', err);
    });
}

function setupShippingFeeInput() {
    const shippingFeeInput = document.getElementById('shippingFee');
    if (!shippingFeeInput) return;

    shippingFeeInput.addEventListener('focus', () => {
        const digitsOnly = shippingFeeInput.value.replace(/[^\d]/g, '');
        shippingFeeInput.value = digitsOnly;
    });

    shippingFeeInput.addEventListener('input', () => {
        const digitsOnly = shippingFeeInput.value.replace(/[^\d]/g, '');
        shippingFeeInput.value = digitsOnly;
    });

    shippingFeeInput.addEventListener('blur', () => {
        shippingFeeInput.value = formatShippingFeeForInput(shippingFeeInput.value);
    });

    shippingFeeInput.value = formatShippingFeeForInput(shippingFeeInput.value);
}

function formatShippingFeeForInput(rawValue) {
    const digitsOnly = rawValue.replace(/[^\d]/g, '');
    if (!digitsOnly) {
        return '';
    }

    const numberValue = parseInt(digitsOnly, 10);
    if (Number.isNaN(numberValue)) {
        return '';
    }

    return numberValue.toLocaleString('vi-VN');
}

function formatShippingFeeForCopy(rawValue) {
    const formatted = formatShippingFeeForInput(rawValue);
    return formatted ? `${formatted}đ` : '';
}
