// Chart.js is loaded via CDN in index.html. This file can hold custom chart helpers if needed.

function formatCurrencyBR(value) {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export { formatCurrencyBR };
