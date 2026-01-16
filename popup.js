const SHEET_ID = '1jjzb4CUl_9iJ9Hlgov7tqqifrRJPojTGkCItJ22PSTk';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;
const PARTNER_SHEET_NAME = 'Doi_Tac_Giao_Hang';
const SUPPLIER_SHEET_NAME = 'Nha_Cung_Cap';
const PARTNER_SHEET_CSV_URL = getSheetCsvUrl(PARTNER_SHEET_NAME);
const SUPPLIER_SHEET_CSV_URL = getSheetCsvUrl(SUPPLIER_SHEET_NAME);
const PARTNER_CSV_PATH = 'doitacgiaohang.csv';
const PARTNER_CACHE_KEY = 'partnerCache';
const SUPPLIER_CSV_PATH = 'nhacungcap.csv';
const SUPPLIER_CACHE_KEY = 'supplierCache';
const CASES_WITH_PARTNER = new Set(['case1', 'case2']);
const PARTNER_SUGGESTION_LIMIT = 80;
const SUPPLIER_SUGGESTION_LIMIT = 80;
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

let supplierRecords = [];
let supplierIndex = {
    byLabel: new Map(),
    byCode: new Map(),
    byName: new Map()
};

const statusState = {
    partner: 'Chưa tải dữ liệu đối tác',
    supplier: 'Chưa tải dữ liệu nhà cung cấp'
};

document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        caseSelect: document.getElementById('caseSelect'),
        partnerRow: document.getElementById('partnerRow'),
        partnerInput: document.getElementById('partnerInput'),
        partnerList: document.getElementById('partnerList'),
        supplierRow: document.getElementById('supplierRow'),
        supplierInput: document.getElementById('supplierInput'),
        supplierList: document.getElementById('supplierList'),
        activationInput: document.getElementById('activationInput'),
        shippingFee: document.getElementById('shippingFee'),
        note: document.getElementById('note'),
        copyButton: document.getElementById('copyButton'),
        refreshButton: document.getElementById('refreshPartners'),
        openSheetButton: document.getElementById('openSheet'),
        dataStatus: document.getElementById('dataStatus')
    };

    setStatus(elements, 'partner', statusState.partner);
    setStatus(elements, 'supplier', statusState.supplier);

    elements.caseSelect.addEventListener('change', () => handleCaseChange(elements));
    elements.partnerInput.addEventListener('input', () => handlePartnerInput(elements));
    elements.supplierInput.addEventListener('input', () => handleSupplierInput(elements));
    elements.copyButton.addEventListener('click', () => copyText(elements));
    elements.refreshButton.addEventListener('click', () => refreshAllData(elements));
    elements.openSheetButton.addEventListener('click', openSheet);

    handleCaseChange(elements);
    setupShippingFeeInput(elements.shippingFee);
    loadAllData(elements);
});



function handlePartnerInput(elements) {
    if (elements.partnerInput.disabled) {
        elements.partnerList.innerHTML = '';
        return;
    }
    renderPartnerOptions(elements.partnerList, partnerRecords, elements.partnerInput.value);
}
function setStatus(elements, key, message) {
    statusState[key] = message;
    elements.dataStatus.textContent = `Đối tác: ${statusState.partner} | Nhà cung cấp: ${statusState.supplier}`;
}

function loadAllData(elements) {
    loadPartnerData(elements);
    loadSupplierData(elements);
}

function loadPartnerData(elements) {
    if (chrome?.storage?.local) {
        chrome.storage.local.get(PARTNER_CACHE_KEY, (result) => {
            const cache = result[PARTNER_CACHE_KEY];
            if (cache?.records?.length) {
                setPartnerRecords(cache.records, elements);
                setStatus(elements, 'partner', `Đã tải dữ liệu đối tác (cache ${formatTimestamp(cache.fetchedAt)})` );
            } else {
                fetchLocalPartnerCsv(elements);
            }
        });
    } else {
        fetchLocalPartnerCsv(elements);
    }
}

function loadSupplierData(elements) {
    if (chrome?.storage?.local) {
        chrome.storage.local.get(SUPPLIER_CACHE_KEY, (result) => {
            const cache = result[SUPPLIER_CACHE_KEY];
            if (cache?.records?.length) {
                setSupplierRecords(cache.records, elements);
                setStatus(elements, 'supplier', `Đã tải dữ liệu nhà cung cấp (cache ${formatTimestamp(cache.fetchedAt)})` );
            } else {
                fetchLocalSupplierCsv(elements);
            }
        });
    } else {
        fetchLocalSupplierCsv(elements);
    }
}

function refreshAllData(elements) {
    setStatus(elements, 'partner', 'Đang tải dữ liệu...');
    setStatus(elements, 'supplier', 'Đang tải dữ liệu...');

    Promise.allSettled([
        refreshPartnerData(elements),
        refreshSupplierData(elements)
    ]).then(() => {
    });
}

function refreshPartnerData(elements) {
    return fetch(PARTNER_SHEET_CSV_URL, { cache: 'no-store' })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Không thể tải dữ liệu đối tác');
            }
            return response.text();
        })
        .then((csvText) => {
            const records = parseCsvRecords(csvText, ['ma', 'madoitac', 'code']);
            if (!records.length) {
                throw new Error('Dữ liệu đối tác trống');
            }
            setPartnerRecords(records, elements);
            setStatus(elements, 'partner', `Đã cập nhật ${records.length} đối tác` );

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
            setStatus(elements, 'partner', 'Tải dữ liệu đối tác thất bại');
        });
}

function refreshSupplierData(elements) {
    return fetch(SUPPLIER_SHEET_CSV_URL, { cache: 'no-store' })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Không thể tải dữ liệu nhà cung cấp');
            }
            return response.text();
        })
        .then((csvText) => {
            const records = parseCsvRecords(csvText, ['ma', 'manhacungcap', 'code', 'ma nha cung cap', 'ma_nha_cung_cap']);
            if (!records.length) {
                throw new Error('Dữ liệu nhà cung cấp trống');
            }
            setSupplierRecords(records, elements);
            setStatus(elements, 'supplier', `Đã cập nhật ${records.length} nhà cung cấp` );

            if (chrome?.storage?.local) {
                chrome.storage.local.set({
                    [SUPPLIER_CACHE_KEY]: {
                        fetchedAt: Date.now(),
                        records
                    }
                });
            }
        })
        .catch((error) => {
            console.error(error);
            setStatus(elements, 'supplier', 'Tải dữ liệu nhà cung cấp thất bại');
        });
}

function fetchLocalPartnerCsv(elements) {
    fetch(PARTNER_CSV_PATH)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Không tìm thấy file đối tác');
            }
            return response.text();
        })
        .then((csvText) => {
            const records = parseCsvRecords(csvText, ['ma', 'madoitac', 'code']);
            if (!records.length) {
                throw new Error('File đối tác trống');
            }
            setPartnerRecords(records, elements);
            setStatus(elements, 'partner', `Đã tải từ file nội bộ (${records.length} đối tác)` );
        })
        .catch((error) => {
            console.error(error);
            setStatus(elements, 'partner', 'Chưa có dữ liệu đối tác');
        });
}

function fetchLocalSupplierCsv(elements) {
    fetch(SUPPLIER_CSV_PATH)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Không tìm thấy file nhà cung cấp');
            }
            return response.text();
        })
        .then((csvText) => {
            const records = parseCsvRecords(csvText, ['ma', 'manhacungcap', 'code', 'ma nha cung cap', 'ma_nha_cung_cap']);
            if (!records.length) {
                throw new Error('File nhà cung cấp trống');
            }
            setSupplierRecords(records, elements);
            setStatus(elements, 'supplier', `Đã tải từ file nội bộ (${records.length} nhà cung cấp)` );
        })
        .catch((error) => {
            console.error(error);
            setStatus(elements, 'supplier', 'Chưa có dữ liệu nhà cung cấp');
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


function setSupplierRecords(records, elements) {
    supplierRecords = records.map((record) => ({
        ...record,
        normalizedCode: normalize(record.code),
        normalizedName: normalize(record.name),
        label: `${record.name} [${record.code}]`,
        labelNormalized: normalize(`${record.name} [${record.code}]`)
    }));
    buildSupplierIndex(records);
    renderSupplierOptions(elements.supplierList, supplierRecords, elements.supplierInput.value);
}

function buildSupplierIndex(records) {
    supplierIndex = {
        byLabel: new Map(),
        byCode: new Map(),
        byName: new Map()
    };

    records.forEach((record) => {
        const label = `${record.name} [${record.code}]`;
        const labelKey = normalize(label);
        const codeKey = normalize(record.code);
        const nameKey = normalize(record.name);

        supplierIndex.byLabel.set(labelKey, label);
        supplierIndex.byCode.set(codeKey, label);
        if (!supplierIndex.byName.has(nameKey)) {
            supplierIndex.byName.set(nameKey, label);
        }
    });
}

function renderSupplierOptions(listElement, records, inputValue) {
    const normalizedInput = normalize(inputValue || '');
    listElement.innerHTML = '';
    if (!normalizedInput) {
        return;
    }

    const matches = getSupplierMatches(records, normalizedInput)
        .slice(0, SUPPLIER_SUGGESTION_LIMIT);

    const fragment = document.createDocumentFragment();

    matches.forEach((record) => {
        const option = document.createElement('option');
        option.value = record.label;
        fragment.appendChild(option);
    });

    listElement.appendChild(fragment);
}

function getSupplierMatches(records, normalizedInput) {
    if (!normalizedInput) {
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

        return false;
    }).sort((a, b) => scoreSupplierMatch(b, normalizedInput) - scoreSupplierMatch(a, normalizedInput));
}

function scoreSupplierMatch(record, normalizedInput) {
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

    return score;
}

function resolveSupplierLabel(inputValue) {
    const trimmed = inputValue.trim();
    if (!trimmed) {
        return '';
    }

    const normalized = normalize(trimmed);

    if (supplierIndex.byLabel.has(normalized)) {
        return supplierIndex.byLabel.get(normalized);
    }

    if (supplierIndex.byCode.has(normalized)) {
        return supplierIndex.byCode.get(normalized);
    }

    if (supplierIndex.byName.has(normalized)) {
        return supplierIndex.byName.get(normalized);
    }

    const matches = getSupplierMatches(supplierRecords, normalized);
    if (matches.length > 0) {
        return matches[0].label;
    }

    return trimmed;
}

function parseCsvRecords(csvText, codeHeaders) {
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
        const isHeader = index === 0 && codeHeaders.includes(normalizedCode) && normalizedName.includes('ten');

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
    const supplierValue = resolveSupplierLabel(elements.supplierInput.value);

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
        if (supplierValue) {
            parts.push(supplierValue);
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
        if (supplierValue) {
            parts.push(supplierValue);
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
        console.error('Không th? sao chép', error);
    });
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
    return formatted ? `${formatted}đ` : '';
}
