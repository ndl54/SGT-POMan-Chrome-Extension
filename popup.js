const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1jjzb4CUl_9iJ9Hlgov7tqqifrRJPojTGkCItJ22PSTk/edit?gid=0#gid=0';
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1jjzb4CUl_9iJ9Hlgov7tqqifrRJPojTGkCItJ22PSTk/export?format=csv&gid=0';
const PARTNER_CSV_PATH = 'doitacgiaohang.csv';
const PARTNER_CACHE_KEY = 'partnerCache';
const CASES_WITH_PARTNER = new Set(['case1', 'case2']);
const PARTNER_SUGGESTION_LIMIT = 80;
const CASE_COPY_LABELS = {
    case1: 'Lấy NCC giao khách',
    case2: 'Lấy NCC về kho',
    case3: 'NCC giao về kho',
    case4: 'NCC giao khách'
};

let partnerRecords = [];
let partnerIndex = {
    byLabel: new Map(),
    byCode: new Map(),
    byName: new Map()
};

document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        caseSelect: document.getElementById('caseSelect'),
        partnerRow: document.getElementById('partnerRow'),
        partnerInput: document.getElementById('partnerInput'),
        partnerList: document.getElementById('partnerList'),
        activationInput: document.getElementById('activationInput'),
        shippingFee: document.getElementById('shippingFee'),
        note: document.getElementById('note'),
        copyButton: document.getElementById('copyButton'),
        refreshButton: document.getElementById('refreshPartners'),
        openSheetButton: document.getElementById('openSheet'),
        dataStatus: document.getElementById('dataStatus')
    };

    elements.caseSelect.addEventListener('change', () => handleCaseChange(elements));
    elements.partnerInput.addEventListener('input', () => handlePartnerInput(elements));
    elements.copyButton.addEventListener('click', () => copyText(elements));
    elements.refreshButton.addEventListener('click', () => refreshPartnerData(elements));
    elements.openSheetButton.addEventListener('click', openSheet);

    handleCaseChange(elements);
    setupShippingFeeInput(elements.shippingFee);
    loadPartnerData(elements);
});

function handleCaseChange(elements) {
    const caseValue = elements.caseSelect.value;
    const canSelectPartner = CASES_WITH_PARTNER.has(caseValue);
    elements.partnerRow.hidden = false;
    elements.partnerInput.disabled = !canSelectPartner;

    if (!canSelectPartner) {
        elements.partnerInput.value = '';
        elements.partnerList.innerHTML = '';
    }
}

function handlePartnerInput(elements) {
    if (elements.partnerInput.disabled) {
        elements.partnerList.innerHTML = '';
        return;
    }
    renderPartnerOptions(elements.partnerList, partnerRecords, elements.partnerInput.value);
}

function openSheet() {
    window.open(SHEET_URL, '_blank', 'noopener');
}

function loadPartnerData(elements) {
    if (chrome?.storage?.local) {
        chrome.storage.local.get(PARTNER_CACHE_KEY, (result) => {
            const cache = result[PARTNER_CACHE_KEY];
            if (cache?.records?.length) {
                setPartnerRecords(cache.records, elements);
                updateStatus(elements, `Đã tải dữ liệu (cache ${formatTimestamp(cache.fetchedAt)})`);
            } else {
                fetchLocalCsv(elements);
            }
        });
    } else {
        fetchLocalCsv(elements);
    }
}

function refreshPartnerData(elements) {
    updateStatus(elements, 'Đang tải dữ liệu...');

    fetch(SHEET_CSV_URL, { cache: 'no-store' })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Không thể tải dữ liệu từ Google Sheet');
            }
            return response.text();
        })
        .then((csvText) => {
            const records = parsePartnerCsv(csvText);
            if (!records.length) {
                throw new Error('Dữ liệu đối tác trống');
            }
            setPartnerRecords(records, elements);
            updateStatus(elements, `Đã cập nhật ${records.length} đối tác`);

            if (chrome?.storage?.local) {
                chrome.storage.local.set({
                    [PARTNER_CACHE_KEY]: {
                        fetchedAt: Date.now(),
                        records
                    }
                });
            }
        })
        .catch((error) => {
            console.error(error);
            updateStatus(elements, 'Tải dữ liệu thất bại');
        });
}

function fetchLocalCsv(elements) {
    fetch(PARTNER_CSV_PATH)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Không tìm thấy file đối tác');
            }
            return response.text();
        })
        .then((csvText) => {
            const records = parsePartnerCsv(csvText);
            if (!records.length) {
                throw new Error('File đối tác trống');
            }
            setPartnerRecords(records, elements);
            updateStatus(elements, `Đã tải từ file nội bộ (${records.length} đối tác)`);
        })
        .catch((error) => {
            console.error(error);
            updateStatus(elements, 'Chưa có dữ liệu đối tác');
        });
}

function setPartnerRecords(records, elements) {
    partnerRecords = records.map((record) => ({
        ...record,
        normalizedCode: normalize(record.code),
        normalizedName: normalize(record.name),
        tokens: splitPartnerTokens(record.name),
        label: `${record.name} [${record.code}]`,
        labelNormalized: normalize(`${record.name} [${record.code}]`)
    }));
    buildPartnerIndex(records);
    renderPartnerOptions(elements.partnerList, partnerRecords, elements.partnerInput.value);
}

function buildPartnerIndex(records) {
    partnerIndex = {
        byLabel: new Map(),
        byCode: new Map(),
        byName: new Map()
    };

    records.forEach((record) => {
        const label = `${record.name} [${record.code}]`;
        const labelKey = normalize(label);
        const codeKey = normalize(record.code);
        const nameKey = normalize(record.name);

        partnerIndex.byLabel.set(labelKey, label);
        partnerIndex.byCode.set(codeKey, label);
        if (!partnerIndex.byName.has(nameKey)) {
            partnerIndex.byName.set(nameKey, label);
        }
    });
}

function renderPartnerOptions(listElement, records, inputValue) {
    const normalizedInput = normalize(inputValue || '');
    listElement.innerHTML = '';
    if (!normalizedInput) {
        return;
    }

    const matches = getPartnerMatches(records, normalizedInput)
        .slice(0, PARTNER_SUGGESTION_LIMIT);

    const fragment = document.createDocumentFragment();

    matches.forEach((record) => {
        const option = document.createElement('option');
        option.value = record.label;
        fragment.appendChild(option);
    });

    listElement.appendChild(fragment);
}

function parsePartnerCsv(csvText) {
    const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
    const records = [];

    lines.forEach((line, index) => {
        const fields = parseCsvLine(line);
        if (fields.length < 2) {
            return;
        }
        const code = fields[0].trim();
        const name = fields[1].trim();

        if (!code || !name) {
            return;
        }

        const normalizedCode = normalize(code);
        const normalizedName = normalize(name);
        const isHeader = index === 0 && (normalizedCode === 'ma' || normalizedCode === 'madoitac' || normalizedCode === 'code') && normalizedName.includes('ten');

        if (isHeader) {
            return;
        }

        records.push({
            code,
            name
        });
    });

    return records;
}

function parseCsvLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === ',' && !inQuotes) {
            fields.push(current);
            current = '';
            continue;
        }

        current += char;
    }

    fields.push(current);
    return fields;
}

function normalize(value) {
    return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function splitPartnerTokens(value) {
    return normalize(value)
        .split('+')
        .map((part) => part.trim())
        .filter(Boolean);
}

function getPartnerMatches(records, normalizedInput) {
    const inputTokens = splitPartnerTokens(normalizedInput);
    if (!inputTokens.length) {
        return [];
    }

    return records.filter((record) => {
        if (record.normalizedCode.includes(normalizedInput)) {
            return true;
        }

        if (record.normalizedName.includes(normalizedInput)) {
            return true;
        }

        if (record.labelNormalized.includes(normalizedInput)) {
            return true;
        }

        return inputTokens.every((token) =>
            record.tokens.some((recordToken) => recordToken.includes(token))
        );
    }).sort((a, b) => scorePartnerMatch(b, normalizedInput, inputTokens) - scorePartnerMatch(a, normalizedInput, inputTokens));
}

function scorePartnerMatch(record, normalizedInput, inputTokens) {
    let score = 0;

    if (record.labelNormalized === normalizedInput) {
        score += 12;
    }

    if (record.normalizedCode === normalizedInput) {
        score += 10;
    }

    if (record.normalizedName === normalizedInput) {
        score += 8;
    }

    if (record.normalizedName.includes(normalizedInput)) {
        score += 4;
    }

    if (record.normalizedCode.includes(normalizedInput)) {
        score += 4;
    }

    inputTokens.forEach((token) => {
        if (record.tokens.some((recordToken) => recordToken.includes(token))) {
            score += 2;
        }
    });

    return score;
}

function resolvePartnerLabel(inputValue) {
    const trimmed = inputValue.trim();
    if (!trimmed) {
        return '';
    }

    const normalized = normalize(trimmed);

    if (partnerIndex.byLabel.has(normalized)) {
        return partnerIndex.byLabel.get(normalized);
    }

    if (partnerIndex.byCode.has(normalized)) {
        return partnerIndex.byCode.get(normalized);
    }

    if (partnerIndex.byName.has(normalized)) {
        return partnerIndex.byName.get(normalized);
    }

    const matches = getPartnerMatches(partnerRecords, normalized);
    if (matches.length > 0) {
        return matches[0].label;
    }

    return trimmed;
}

function copyText(elements) {
    const caseValue = elements.caseSelect.value;
    const caseLabel = CASE_COPY_LABELS[caseValue] || '';
    const activationValue = elements.activationInput.value.trim();
    const partnerValue = resolvePartnerLabel(elements.partnerInput.value);

    if (!caseValue) {
        alert('Vui lòng chọn trường hợp.');
        return;
    }

    if (CASES_WITH_PARTNER.has(caseValue) && !partnerValue) {
        alert('Vui lòng nhập tên hoặc mã đối tác giao hàng.');
        return;
    }

    if (!activationValue) {
        alert('Vui lòng chọn trạng thái kích hoạt.');
        return;
    }

    const parts = [];

    if (CASES_WITH_PARTNER.has(caseValue)) {
        if (partnerValue) {
            parts.push(partnerValue);
        }
        if (caseLabel) {
            parts.push(caseLabel);
        }
    } else {
        if (caseLabel) {
            parts.push(caseLabel);
        }
        if (partnerValue) {
            parts.push(partnerValue);
        }
    }

    if (activationValue) {
        parts.push(activationValue);
    }

    const formattedShippingFee = formatShippingFeeForCopy(elements.shippingFee.value.trim());
    if (formattedShippingFee) {
        parts.push(`Cước: ${formattedShippingFee}`);
    }

    const noteValue = elements.note.value.trim();
    if (noteValue) {
        parts.push(noteValue);
    }

    const textToCopy = parts.join(' | ');

    navigator.clipboard.writeText(textToCopy).then(() => {
    }).catch((error) => {
        console.error('Không thể sao chép', error);
    });
}

function updateStatus(elements, message) {
    elements.dataStatus.textContent = message;
}

function formatTimestamp(timestamp) {
    if (!timestamp) {
        return '';
    }

    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN');
}

function setupShippingFeeInput(shippingFeeInput) {
    if (!shippingFeeInput) {
        return;
    }

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
    return formatted ? `${formatted}₫` : '';
}
