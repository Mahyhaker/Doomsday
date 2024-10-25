const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('search');
const pokemonContainer = document.getElementById('pokemonContainer');

searchBtn.addEventListener('click', () => {
    const searchTerm = searchInput.value.toLowerCase();
    fetchPokemon(searchTerm);
});

async function fetchPokemon(nameOrId) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId}`);
        if (!response.ok) throw new Error('Pokémon não encontrado');
        const data = await response.json();
        displayPokemon(data);
    } catch (error) {
        pokemonContainer.innerHTML = `<p>${error.message}</p>`;
    }
}

function displayPokemon(pokemon) {
    pokemonContainer.innerHTML = `
        <div class="pokemon">
            <h2>${pokemon.name}</h2>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
            <p>ID: ${pokemon.id}</p>
            <p>Tipo(s): ${pokemon.types.map(type => type.type.name).join(', ')}</p>
        </div>
    `;
}
