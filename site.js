async function fetchBazaarData() {
    const status = document.getElementById('status');
    const tbody = document.getElementById('gemBody');
    
    if (status) status.innerHTML = "Aktualizacja (Logika: Baza x9 vs Condensed)...";
    
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

            // Uniwersalna funkcja pobierania ceny z arkuszy (zgodnie z obrazkiem 6c4262)
            const getPriceFromSummary = (product, summaryType) => {
                if (summaryType === 'sell') { // Dla przedmiotów bazowych (nasz koszt)
                    return product.sell_summary && product.sell_summary.length > 0 
                        ? product.sell_summary[0].pricePerUnit 
                        : product.quick_status.sellPrice;
                } else { // Dla przedmiotów skraftowanych (nasz przychód)
                    return product.buy_summary && product.buy_summary.length > 0 
                        ? product.buy_summary[0].pricePerUnit 
                        : product.quick_status.buyPrice;
                }
            };

            const taxRate = 0.011; // Podatek 1.1%

            // --- SEKCJA 1: GEMSTONE (80x Fine -> Flawless) ---
            const gemTypes = ["RUBY", "AMETHYST", "JADE", "AMBER", "TOPAZ", "SAPPHIRE", "JASPER", "OPAL", "AQUAMARINE", "ONYX", "CITRINE", "PERIDOT"];
            
            gemTypes.forEach(type => {
                const fine = products[`FINE_${type}_GEM`];
                const flawless = products[`FLAWLESS_${type}_GEM`];

                if (fine && flawless) {
                    const priceFine = getPriceFromSummary(fine, 'sell'); // Jak Fine
                    const priceFlawless = getPriceFromSummary(flawless, 'buy'); // Jak Flawless
                    
                    const cost80 = priceFine * 80;
                    const netProfit = (priceFlawless * (1 - taxRate)) - cost80;

                    tbody.innerHTML += `<tr>
                        <td class="gem-${type.toLowerCase()}"><strong>${type}</strong></td>
                        <td style="color: #55cdff;">${format(priceFine)}</td>
                        <td style="color: #aa00aa;">${format(priceFlawless)}</td>
                        <td style="color: #ffac1c;">${format(cost80)}</td>
                        <td style="color: ${netProfit >= 0 ? '#00ff00' : '#ff4444'}; font-weight: bold;">
                            ${netProfit >= 0 ? "+" : ""}${format(netProfit)}
                        </td>
                    </tr>`;
                }
            });

            // --- SEKCJA 2: ROLNICTWO (Fermento/Helianthus) ---
            const farmItems = [
                { base: "FERMENTO", condensed: "CONDENSED_FERMENTO", label: "Fermento" },
                { base: "FLOWERING_HELIANTHUS", condensed: "CONDENSED_HELIANTHUS", label: "Helianthus" }
            ];

            farmItems.forEach(item => {
                const baseProd = products[item.base];
                const condProd = products[item.condensed];

                if (baseProd && condProd) {
                    // TWOJA PROŚBA: Cena bazy pobierana jak "Fine" (sell_summary)
                    const priceBaseUnit = getPriceFromSummary(baseProd, 'sell');
                    
                    // TWOJA PROŚBA: Cena skondensowanego pobierana jak "Flawless" (buy_summary)
                    const priceCondensed = getPriceFromSummary(condProd, 'buy');
                    
                    const cost9x = priceBaseUnit * 9; // Koszt 9 sztuk bazy
                    const netProfit = (priceCondensed * (1 - taxRate)) - cost9x; // Zysk po podatku

                    tbody.innerHTML += `<tr>
                        <td><strong>${item.label}</strong></td>
                        <td style="color: #55cdff;">${format(cost9x)} (x9)</td>
                        <td style="color: #aa00aa;">${format(priceCondensed)}</td>
                        <td style="color: #888;">---</td>
                        <td style="color: ${netProfit >= 0 ? '#00ff00' : '#ff4444'}; font-weight: bold;">
                            ${netProfit >= 0 ? "+" : ""}${format(netProfit)}
                        </td>
                    </tr>`;
                }
            });

            const time = new Date().toLocaleTimeString('pl-PL');
            status.innerHTML = `Zaktualizowano: ${time}<br>
                               <small>Podatek: 1.1% | Fermento: x9 (sell_summary) | Condensed: buy_summary</small>`;
        }
    } catch (error) {
        if (status) status.innerHTML = `<span style="color: red;">Błąd: ${error.message}</span>`;
    }
}

document.addEventListener('DOMContentLoaded', fetchBazaarData);
