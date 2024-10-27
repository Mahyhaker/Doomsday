const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('search');
const pokemonContainer = document.getElementById('pokemonContainer');
const searchHistory = document.getElementById('searchHistory');
const loading = document.getElementById('loading');

let searchedPokemons = [];

// Carregar histórico do localStorage
const loadHistory = () => {
    const savedHistory = localStorage.getItem('pokemonHistory');
    if (savedHistory) {
        searchedPokemons = JSON.parse(savedHistory);
        updateHistoryDisplay();
    }
};

// Salvar histórico no localStorage
const saveHistory = () => {
    localStorage.setItem('pokemonHistory', JSON.stringify(searchedPokemons));
};

// Adicionar ao histórico
const addToHistory = (pokemon) => {
    const existingIndex = searchedPokemons.findIndex(p => p.id === pokemon.id);
    if (existingIndex !== -1) {
        searchedPokemons.splice(existingIndex, 1);
    }
    searchedPokemons.unshift(pokemon);
    if (searchedPokemons.length > 3) {
        searchedPokemons.pop();
    }
    saveHistory();
    updateHistoryDisplay();
};

// Atualizar display do histórico
const updateHistoryDisplay = () => {
    searchHistory.innerHTML = searchedPokemons.map(pokemon => `
        <div class="history-item" onclick="fetchPokemon('${pokemon.name}')">
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" style="width: 50px;">
            <p>${pokemon.name}</p>
        </div>
    `).join('');
};

// Mostrar loading
const showLoading = () => {
    loading.classList.remove('hidden');
};

// Esconder loading
const hideLoading = () => {
    loading.classList.add('hidden');
};

// Buscar Pokémon
async function fetchPokemon(nameOrId) {
    showLoading();
    pokemonContainer.classList.add('hidden');
    
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId.toLowerCase()}`);
        if (!response.ok) throw new Error('Pokémon não encontrado');
        
        const pokemon = await response.json();
        
        // Buscar descrição do Pokémon
        const speciesResponse = await fetch(pokemon.species.url);
        const speciesData = await speciesResponse.json();
        
        // Encontrar descrição em português ou inglês
        const description = speciesData.flavor_text_entries.find(
            entry => entry.language.name === 'pt-br' || entry.language.name === 'en'
        )?.flavor_text.replace(/\f/g, ' ') || 'Descrição não disponível';
        
        displayPokemon(pokemon, description);
        addToHistory(pokemon);
        
    } catch (error) {
        pokemonContainer.innerHTML = `
            <div class="error-message">
                <h2>Erro!</h2>
                <p>${error.message}</p>
            </div>
        `;
        pokemonContainer.classList.remove('hidden');
    } finally {
        hideLoading();
    }
}

// Exibir Pokémon
function displayPokemon(pokemon, description) {
    const statsHTML = pokemon.stats.map(stat => {
        const statValue = stat.base_stat;
        return `
            <div class="stat">
                <p>${stat.stat.name}: ${statValue}</p>
                <div class="stat-bar">
                    <div class="stat-fill" style="width: ${(statValue / 255) * 100}%"></div>
                </div>
            </div>
        `;
    }).join('');

    const abilitiesHTML = pokemon.abilities
        .map(ability => ability.ability.name.replace('-', ' '))
        .join(', ');

    pokemonContainer.innerHTML = `
        <div class="pokemon-info">
            <div class="pokemon-image">
                <h2>${pokemon.name}</h2>
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                <div class="pokemon-types">
                    ${pokemon.types.map(type => 
                        `<span class="type-tag ${type.type.name}">${type.type.name}</span>`
                    ).join('')}
                </div>
                <p class="pokemon-id">Nº ${String(pokemon.id).padStart(3, '0')}</p>
            </div>
            <div class="pokemon-details">
                <div class="description">
                    <h3>Descrição</h3>
                    <p>${description}</p>
                </div>
                <div class="physical-info">
                    <p>Altura: ${pokemon.height / 10}m</p>
                    <p>Peso: ${pokemon.weight / 10}kg</p>
                </div>
                <div class="abilities">
                    <h3>Habilidades</h3>
                    <p>${abilitiesHTML}</p>
                </div>
                <div class="stats-container">
                    <h3>Status</h3>
                    ${statsHTML}
                </div>
            </div>
        </div>
    `;
    
    pokemonContainer.classList.remove('hidden');
}

// Event Listeners
searchBtn.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        fetchPokemon(searchTerm);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            fetchPokemon(searchTerm);
        }
    }
});

// Carregar histórico ao iniciar
loadHistory();