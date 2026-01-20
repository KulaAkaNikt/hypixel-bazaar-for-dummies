async function fetchBazaarData() {
    const status = document.getElementById('status');
    const tbody = document.getElementById('gemBody');
    
    if (status) status.innerHTML = "Pobieranie cen bezpośrednich z API...";
    
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
                if (type === 'buy') { // Nasz koszt (Instant Buy)
                    return product.sell_summary && product.sell_summary.length > 0 
                        ? product.sell_summary[0].pricePerUnit 
                        : product.quick_status.sellPrice;
                } else { // Nasz przychód (Instant Sell)
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

            // --- SEKCJA 2: ROLNICTWO (Ceny bezpośrednie z API) ---
            const farmItems = [
                { base: "FERMENTO", condensed: "CONDENSED_FERMENTO", label: "Fermento" },
                { base: "FLOWERING_HELIANTHUS", condensed: "CONDENSED_HELIANTHUS", label: "Helianthus" }
            ];

            farmItems.forEach(item => {
                const baseProd = products[item.base];
                const condProd = products[item.condensed];

                if (baseProd && condProd) {
                    const priceBaseUnit = getPrice(baseProd, 'buy'); // Cena 1 sztuki bazy (sell_summary[0])
                    const priceCondensedDirect = getPrice(condProd, 'sell'); // Cena sprzedaży gotowca (buy_summary[0])
                    
                    const cost8x = priceBaseUnit * 8;
                    const cost64x = priceBaseUnit * 64;
                    const netProfit = (priceCondensedDirect * (1 - taxRate)) - cost64x;

                    // Wiersz pośredni (koszt 8 sztuk)
                    tbody.innerHTML += `<tr>
                        <td><strong>8x ${item.label}</strong></td>
                        <td style="color: #55cdff;">${format(priceBaseUnit)}</td>
                        <td style="color: #ffffff;">---</td>
                        <td style="color: #ffac1c;">${format(cost8x)}</td>
                        <td style="color: #888;">Koszt x8</td>
                    </tr>`;

                    // Wiersz docelowy (Condensed - cena pobrana bezpośrednio z API)
                    tbody.innerHTML += `<tr>
                        <td><strong>Condensed ${item.label}</strong></td>
                        <td style="color: #55cdff;">${format(priceBaseUnit)}</td>
                        <td style="color: #aa00aa;">${format(priceCondensedDirect)}</td>
                        <td style="color: #ffac1c;">${format(cost64x)}</td>
                        <td style="color: ${netProfit >= 0 ? '#00ff00' : '#ff4444'}; font-weight: bold;">
                            ${netProfit >= 0 ? "+" : ""}${format(netProfit)}
                        </td>
                    </tr>`;
                }
            });

            const time = new Date().toLocaleTimeString('pl-PL');
            status.innerHTML = `Zaktualizowano: ${time}<br>
                               <small>Ceny bezpośrednie z API | Podatek: 1.1%</small>`;
        }
    } catch (error) {
        if (status) status.innerHTML = `<span style="color: red;">Błąd: ${error.message}</span>`;
    }
}

document.addEventListener('DOMContentLoaded', fetchBazaarData);
