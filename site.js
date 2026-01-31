async function fetchBazaarData() {
    const status = document.getElementById('status');
    const tbody = document.getElementById('gemBody');
    
    if (status) status.innerHTML = "Aktualizacja...";
    
    const apiUrl = "https://api.hypixel.net/v2/skyblock/bazaar";
    const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(apiUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`Błąd API: ${response.status}`);

        const data = await response.json();

        if (data.success && tbody) {
            tbody.innerHTML = ""; 
            const products = data.products;

            const format = num => {
                return num.toLocaleString('pl-PL', {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1
                });
            };

            const getPriceFromSummary = (product, summaryType) => {
                if (summaryType === 'sell') {
                    return product.sell_summary && product.sell_summary.length > 0 
                        ? product.sell_summary[0].pricePerUnit 
                        : product.quick_status.sellPrice;
                } else {
                    return product.buy_summary && product.buy_summary.length > 0 
                        ? product.buy_summary[0].pricePerUnit 
                        : product.quick_status.buyPrice;
                }
            };

            const taxRate = 0.011;

            const gemTypes = ["RUBY", "AMETHYST", "JADE", "AMBER", "TOPAZ", "SAPPHIRE", "JASPER", "OPAL", "AQUAMARINE", "ONYX", "CITRINE", "PERIDOT"];
            gemTypes.forEach(type => {
                const fine = products[`FINE_${type}_GEM`];
                const flawless = products[`FLAWLESS_${type}_GEM`];
                if (fine && flawless) {
                    const priceFine = getPriceFromSummary(fine, 'sell');
                    const priceFlawless = getPriceFromSummary(flawless, 'buy');
                    const cost80 = priceFine * 80;
                    const netProfit = (priceFlawless * (1 - taxRate)) - cost80;

                  tbody.innerHTML += `<tr>
    <td class="gem-cell gem-${type.toLowerCase()}">
        <img
            src="icons/${type.toLowerCase()}.png"
            alt="${type}"
            class="gem-icon"
        >
        <strong>${type}</strong>
    </td>
                        <td style="color: #55cdff;">${format(priceFine)}</td>
                        <td style="color: #aa00aa;">${format(priceFlawless)}</td>
                        <td style="color: #ffac1c;">${format(cost80)}</td>
                        <td style="color: ${netProfit >= 0 ? '#00ff00' : '#ff4444'}; font-weight: bold;">
                            ${netProfit >= 0 ? "+" : ""}${format(netProfit)}
                        </td>
                    </tr>`;
                }
            });
            const farmItems = [
                { base: "FERMENTO", condensed: "CONDENSED_FERMENTO", label: "Fermento" },
                { base: "HELIANTHUS", condensed: "CONDENSED_HELIANTHUS", label: "Helianthus" }
            ];

            farmItems.forEach(item => {
                const baseProd = products[item.base];
                const condProd = products[item.condensed];

                if (baseProd && condProd) {
                    const priceBaseUnit = getPriceFromSummary(baseProd, 'sell');
                    const priceCondensed = getPriceFromSummary(condProd, 'buy');
                    
                    const cost9x = priceBaseUnit * 9; 
                    const netProfit = (priceCondensed * (1 - taxRate)) - cost9x;

                    tbody.innerHTML += `<tr>
                        <td><strong>${item.label}</strong></td>
                        <td style="color: #55cdff;">${format(cost9x)} (x9)</td>
                        <td style="color: #aa00aa;">${format(priceCondensed)}</td>
                        <td style="color: #888;">---</td>
                        <td style="color: ${netProfit >= 0 ? '#00ff00' : '#ff4444'}; font-weight: bold;">
                            ${netProfit >= 0 ? "+" : ""}${format(netProfit)}
                        </td>
                    </tr>`;
                } else {
                    console.warn(`Nie znaleziono produktu: ${item.base} lub ${item.condensed}`);
                }
            });

            const time = new Date().toLocaleTimeString('pl-PL');
            status.innerHTML = `Zaktualizowano: ${time}`;
        }
    } catch (error) {
        if (status) status.innerHTML = `<span style="color: red;">Błąd: ${error.message}</span>`;
    }
}
document.addEventListener('DOMContentLoaded', fetchBazaarData);



