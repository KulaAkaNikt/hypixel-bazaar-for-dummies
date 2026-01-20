async function fetchBazaarData() {
    const status = document.getElementById('status');
    const tbody = document.getElementById('gemBody');
    
    if (status) status.innerHTML = "Aktualizacja cen (Logika: Instant Buy/Sell)...";
    
    const apiUrl = "https://api.hypixel.net/v2/skyblock/bazaar";
    const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(apiUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`Błąd połączenia: ${response.status}`);

        const data = await response.json();

        if (data.success && tbody) {
            tbody.innerHTML = ""; 
            const products = data.products;
            const gemTypes = [
                "RUBY", "AMETHYST", "JADE", "AMBER", "TOPAZ", "SAPPHIRE", "JASPER", "OPAL",
                "AQUAMARINE", "ONYX", "CITRINE", "PERIDOT"
            ];
            
            gemTypes.forEach(type => {
                const fineKey = `FINE_${type}_GEM`;
                const flawlessKey = `FLAWLESS_${type}_GEM`;

                if (products[fineKey] && products[flawlessKey]) {
                    const fine = products[fineKey];
                    const flawless = products[flawlessKey];

                    // LOGIKA Z TWOJEGO KODU:
                    // 1. Kupujesz Fine po cenie Sell Offer (najniższa cena sprzedaży)
                    const finePurchasePrice = Math.round(fine.quick_status?.sellPrice || 0);
                    
                    // 2. Sprzedajesz Flawless po cenie Buy Order (najwyższa cena kupna)
                    const flawlessSalePrice = Math.round(flawless.quick_status?.buyPrice || 0);
                    
                    // 3. OBLICZENIA Z PODATKIEM (1%)
                    const cost80Fine = finePurchasePrice * 80;
                    const tax = 0.01;
                    const revenueAfterTax = flawlessSalePrice * (1 - tax);
                    const netProfit = revenueAfterTax - cost80Fine;

                    const format = num => Math.round(num).toLocaleString('pl-PL');

                    const row = `<tr>
                        <td class="gem-${type.toLowerCase()}"><strong>${type}</strong></td>
                        <td style="color: #55cdff;">${format(finePurchasePrice)}</td>
                        <td style="color: #aa00aa;">${format(flawlessSalePrice)}</td>
                        <td style="color: #ffac1c;">${format(cost80Fine)}</td>
                        <td style="color: ${netProfit >= 0 ? '#00ff00' : '#ff4444'}; font-weight: bold;">
                            ${netProfit >= 0 ? '+' : ''}${format(netProfit)}
                        </td>
                    </tr>`;
                    
                    tbody.innerHTML += row;
                }
            });

            const time = new Date().toLocaleTimeString('pl-PL');
            status.innerHTML = `Zaktualizowano: ${time}<br>
                               <small>Fine: Instant Buy | Flawless: Instant Sell | Podatek: 1%</small>`;
        }
    } catch (error) {
        if (status) status.innerHTML = `<span style="color: red;">Błąd: ${error.message}</span>`;
    }
}

document.addEventListener('DOMContentLoaded', fetchBazaarData);
