async function fetchBazaarDataSimple() {
    const status = document.getElementById('status');
    const tbody = document.getElementById('gemBody');
    
    if (status) status.innerText = "Ładowanie cen...";
    if (tbody) tbody.innerHTML = "";

    try {
        // Bezpośrednie API z fallback na proxy
        const apiUrl = "https://api.hypixel.net/v2/skyblock/bazaar";
        
        // Spróbuj bezpośrednio
        let response = await fetch(apiUrl);
        
        // Jeśli nie działa, użyj proxy
        if (!response.ok) {
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
            response = await fetch(proxyUrl);
        }
        
        if (!response.ok) throw new Error("Nie można połączyć się z API");
        
        const data = await response.json();
        
        if (!data.success) throw new Error("API zwróciło błąd");

        const products = data.products;
        const gemTypes = ["RUBY", "AMETHYST", "JADE", "AMBER", "TOPAZ", "SAPPHIRE", 
                         "JASPER", "OPAL", "AQUAMARINE", "ONYX", "CITRINE", "PERIDOT"];

        gemTypes.forEach(type => {
            const fineKey = `FINE_${type}_GEM`;
            const flawlessKey = `FLAWLESS_${type}_GEM`;

            if (products[fineKey] && products[flawlessKey]) {
                const fine = products[fineKey];
                const flawless = products[flawlessKey];
                
                const fineBuyPrice = Math.round(fine.quick_status?.buyPrice || 0);
                
                const flawlessSellPrice = Math.round(flawless.quick_status?.sellPrice || 0);
                
                const finePurchasePrice = Math.round(fine.quick_status?.sellPrice || 0); 
                const flawlessSalePrice = Math.round(flawless.quick_status?.buyPrice || 0); 
                
                const cost80Fine = finePurchasePrice * 80;
                const profit = flawlessSalePrice - cost80Fine;
                
                const format = num => num.toLocaleString('pl-PL');
                
                const row = `<tr>
                    <td class="gem-${type.toLowerCase()}">${type}</td>
                    <td>${format(finePurchasePrice)}</td>
                    <td>${format(flawlessSalePrice)}</td>
                    <td>${format(cost80Fine)}</td>
                    <td class="${profit >= 0 ? 'profit' : 'loss'}">
                        ${profit >= 0 ? '+' : ''}${format(profit)}
                    </td>
                </tr>`;
                
                tbody.innerHTML += row;
            }
        });

        if (status) {
            const time = new Date().toLocaleTimeString('pl-PL');
            status.innerHTML = `Zaktualizowano: ${time}<br>
                               <small>Fine: cena kupna | Flawless: cena sprzedaży</small>`;
        }

    } catch (error) {
        console.error("Błąd:", error);
        if (status) status.innerHTML = `<span style="color: red">Błąd: ${error.message}</span>`;
    }
}

// Użyj tej uproszczonej wersji
document.addEventListener('DOMContentLoaded', fetchBazaarDataSimple);
