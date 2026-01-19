async function fetchBazaarData() {
    const status = document.getElementById('status');
    const tbody = document.getElementById('gemBody');
    
    if (status) status.innerText = "Pobieranie danych (Proxy: CodeTabs)...";
    if (tbody) tbody.innerHTML = ""; 

    const apiUrl = "https://api.hypixel.net/v2/skyblock/bazaar";
    
    // ZMIANA: Używamy CodeTabs - jest stabilniejsze dla dużych plików JSON
    const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(apiUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            throw new Error(`Błąd sieci: ${response.status}`);
        }

        // CodeTabs zwraca czysty JSON, nie musimy używać JSON.parse(contents)
        const data = await response.json();

        if (data.success && tbody) {
            const products = data.products;
            
            const gemTypes = [
                "RUBY", "AMETHYST", "JADE", "AMBER", "TOPAZ", "SAPPHIRE", "JASPER", "OPAL",
                "AQUAMARINE", "ONYX", "CITRINE", "PERIDOT"
            ];
            
            let foundCount = 0;

            gemTypes.forEach(type => {
                const fineKey = `FINE_${type}_GEM`;
                const flawlessKey = `FLAWLESS_${type}_GEM`;

                if (products[fineKey] && products[flawlessKey]) {
                    foundCount++;
                    const finePrice = products[fineKey].quick_status.buyPrice;
                    const flawlessPrice = products[flawlessKey].quick_status.buyPrice;
                    const fineX80 = finePrice * 80;
                    const diff = flawlessPrice - fineX80;

                    const row = `<tr>
                        <td class="gem-${type.toLowerCase()}"><strong>${type}</strong></td>
                        <td style="color: #55cdff;">${Math.round(finePrice).toLocaleString()}</td>
                        <td style="color: #aa00aa;">${Math.round(flawlessPrice).toLocaleString()}</td>
                        <td style="color: #ffac1c;">${Math.round(fineX80).toLocaleString()}</td>
                        <td style="color: ${diff > 0 ? '#00ff00' : '#ff4444'}; font-weight: bold;">
                            ${diff > 0 ? "ZYSK: " : "STRATA: "}${Math.abs(Math.round(diff)).toLocaleString()}
                        </td>
                    </tr>`;
                    tbody.innerHTML += row;
                }
            });

            if (status) status.innerText = `Sukces! Zaktualizowano: ${new Date().toLocaleTimeString()}`;
        } else {
            throw new Error("API nie zwróciło danych (success: false)");
        }

    } catch (error) {
        console.error(error);
        if (status) {
            status.innerHTML = `<span style="color: red; font-weight: bold;">BŁĄD: ${error.message} <br> Spróbuj odświeżyć stronę (F5).</span>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', fetchBazaarData);
