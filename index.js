const categories = document.querySelectorAll('input[type="checkbox"]');
const items = document.getElementById('items');
let itemData = null;

// Loads item data
fetch('item-data.json')
    .then(response => response.json())
    .then(data => {
        itemData = data;
        updateItemList();
    });

categories.forEach(category => {
    category.addEventListener('change', () => {
        if (category.id !== 'cat0' && category.id !== 'cat1') {
            const selectedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
            const selectedCount = selectedCheckboxes.length - 2; // Subtract the default checkboxes

            // Disable the remaining checkboxes if the user selects 3
            if (selectedCount >= 3) {
                categories.forEach(checkbox => {
                    if (checkbox.id !== 'cat0' && checkbox.id !== 'cat1' && !checkbox.checked) {
                        checkbox.disabled = true;
                    }
                });
            } else {
                categories.forEach(checkbox => {
                    if (checkbox.id !== 'cat0' && checkbox.id !== 'cat1') {
                        checkbox.disabled = false;
                    }
                });
            }

            // Uncheck the last selected checkbox if the user exceeds the limit
            if (selectedCount > 3) {
                const lastSelected = selectedCheckboxes[selectedCheckboxes.length - 1];
                lastSelected.checked = false;
            }
        }
        updateItemList();
    });
});

function updateItemList() {
    if (!itemData) {
        return;
    }

    // Clear existing region boxes
    items.innerHTML = '';

    // Create a Set to keep track of displayed items to avoid duplicates
    const displayedItems = new Set();

    // Group items by regions
    const regions = {};

    const selectedCategories = [];
    categories.forEach(category => {
        if (category.checked) {
            selectedCategories.push(category.id);
        }
    });

    itemData.items.forEach(item => {
        if (item.regions.every(region => selectedCategories.includes(`cat${region}`))) {
            item.regions.sort(); // Sort to handle combined regions in a consistent order
            const regionKey = item.regions.join(',');
            if (!regions[regionKey]) {
                regions[regionKey] = [];
            }

            // Check if the item is not a duplicate before adding it
            if (!displayedItems.has(item.name)) {
                regions[regionKey].push(item);
                displayedItems.add(item.name);
            }
        }
    });

    // Create a box for each region (combined regions at the bottom)
    for (const region in regions) {
        const regionBox = document.createElement('div');
        regionBox.className = 'region-box';

        const regionTitle = document.createElement('div');
        regionTitle.className = 'region-title';
        const regionIds = region.split(',').map(Number);
        if (regionIds.length > 1) {
            // Handle combined regions
            const regionNames = regionIds.map(getRegionName);
            regionTitle.innerText = regionNames.join(' & ');
        } else {
            // Handle individual regions
            regionTitle.innerText = getRegionName(regionIds[0]);
        }
        regionBox.appendChild(regionTitle);

        const regionItemList = document.createElement('ul');
        regionItemList.className = 'region-items';

        regions[region].forEach(item => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<div class="list-item"><img loading="lazy" crossorigin="anonymous" src="${item.imgUrl}" alt="${item.name}"></div><span>${item.name}</span>`;
            regionItemList.appendChild(listItem);
        });

        regionBox.appendChild(regionItemList);
        items.appendChild(regionBox);
    }
}

function getRegionName(regionId) {
    const regionNames = {
        0: 'Misthalin',
        1: 'Karamja',
        2: 'Asgarnia',
        3: 'Desert',
        4: 'Fremennik',
        5: 'Kandarin',
        6: 'Morytania',
        7: 'Tirannwyn',
        8: 'Wilderness',
        9: 'Kourend'
    };

    return regionNames[regionId] || `Region ${regionId}`;
}