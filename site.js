async function fetchBazaarData() {
    const status = document.getElementById('status');
    const tbody = document.getElementById('gemBody');
    
    if (status) status.innerHTML = "Aktualizacja cen (Specjalna logika Fermento)...";
    
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

            const getPrice = (product, type) => {
                if (type === 'buy') {
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

            // --- SEKCJA 1: GEMSTONE (Standardowa logika 80x) ---
            const gemTypes = ["RUBY", "AMETHYST", "JADE", "AMBER", "TOPAZ", "SAPPHIRE", "JASPER", "OPAL", "AQUAMARINE", "ONYX", "CITRINE", "PERIDOT"];
            
            gemTypes.forEach(type => {
                const fine = products[`FINE_${type}_GEM`];
                const flawless = products[`FLAWLESS_${type}_GEM`];

                if (fine && flawless) {
                    const buyFine = getPrice(fine, 'buy');
                    const sellFlawless = getPrice(flawless, 'sell');
                    const cost80 = buyFine * 80;
                    const netProfit = (sellFlawless * (1 - taxRate)) - cost80;

                    tbody.innerHTML += `<tr>
                        <td class="gem-${type.toLowerCase()}"><strong>${type}</strong></td>
                        <td style="color: #55cdff;">${format(buyFine)}</td>
                        <td style="color: #aa00aa;">${format(sellFlawless)}</td>
                        <td style="color: #ffac1c;">${format(cost80)}</td>
                        <td style="color: ${netProfit >= 0 ? '#00ff00' : '#ff4444'}; font-weight: bold;">
                            ${netProfit >= 0 ? "+" : ""}${format(netProfit)}
                        </td>
                    </tr>`;
                }
            });

            // --- SEKCJA 2: ROLNICTWO (Twoja nowa logika x9) ---
            const farmItems = [
                { base: "FERMENTO", condensed: "CONDENSED_FERMENTO", label: "Fermento" },
                { base: "FLOWERING_HELIANTHUS", condensed: "CONDENSED_HELIANTHUS", label: "Helianthus" }
            ];

            farmItems.forEach(item => {
                const baseProd = products[item.base];
                const condProd = products[item.condensed];

                if (baseProd && condProd) {
                    const priceBaseUnit = getPrice(baseProd, 'buy');
                    const priceCondensedDirect = getPrice(condProd, 'sell');
                    
                    const cost9x = priceBaseUnit * 9; // TWOJA PROŚBA: Cena bazowa x9
                    const netProfit = (priceCondensedDirect * (1 - taxRate)) - cost9x; // TWOJA PROŚBA: Zysk = Condensed - (Base * 9)

                    tbody.innerHTML += `<tr>
                        <td><strong>${item.label}</strong></td>
                        <td style="color: #55cdff;">${format(cost9x)} (x9)</td>
                        <td style="color: #aa00aa;">${format(priceCondensedDirect)}</td>
                        <td style="color: #888;">---</td>
                        <td style="color: ${netProfit >= 0 ? '#00ff00' : '#ff4444'}; font-weight: bold;">
                            ${netProfit >= 0 ? "+" : ""}${format(netProfit)}
                        </td>
                    </tr>`;
                }
            });

            const time = new Date().toLocaleTimeString('pl-PL');
            status.innerHTML = `Zaktualizowano: ${time}<br>
                               <small>Logika: Gemy (80x) | Rolnictwo (9x) | Podatek: 1.1%</small>`;
        }
    } catch (error) {
        if (status) status.innerHTML = `<span style="color: red;">Błąd: ${error.message}</span>`;
    }
}

document.addEventListener('DOMContentLoaded', fetchBazaarData);
