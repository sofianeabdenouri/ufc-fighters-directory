// Utility function to sanitize names (removes accents, special characters)
const sanitizeName = (firstName = '', lastName = '') => {
    const fullName = [firstName, lastName]
        .filter(Boolean)               // Remove empty or undefined names
        .join(' ')                     // Join with space if both names are present
        .normalize('NFD')              // Normalize to decompose accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .toLowerCase()                 // Convert to lowercase
        .replace(/['-]/g, '')          // Remove apostrophes and hyphens
        .replace(/[^a-z0-9\s]/g, '')   // Remove non-alphanumeric characters
        .replace(/\s+/g, '_')          // Replace spaces with underscores
        .trim();                       // Remove leading/trailing spaces
    
    return fullName;
};


function FighterList() {
    const [fighters, setFighters] = useState([]);
    const [filteredFighters, setFilteredFighters] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('');

    const apiKey = 'YOUR_API_KEY'; // Replace with your API key
    const apiUrl = `https://api.sportsdata.io/v3/mma/scores/json/FightersBasic?key=${apiKey}`;

    // Fetch fighters data
    useEffect(() => {
        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                const uniqueFighters = [];
                const namesSet = new Set();

                data.forEach((fighter) => {
                    const fullName = `${fighter.FirstName} ${fighter.LastName}`;
                    if (!namesSet.has(fullName)) {
                        namesSet.add(fullName);
                        uniqueFighters.push(fighter);
                    }
                });

                setFighters(uniqueFighters);
                setFilteredFighters(uniqueFighters);
            })
            .catch((error) => console.error('Error fetching data:', error));
    }, []);

    // Handle search input
    const handleSearch = () => {
        const sanitizedTerm = sanitizeName(searchTerm);
    
        const filtered = fighters.filter((fighter) => {
            const fullName = sanitizeName(fighter.FirstName, fighter.LastName);
            return fullName.includes(sanitizedTerm);
        });
    
        setFilteredFighters(filtered);
    };
    

    // Handle sorting logic
    const handleSort = (e) => {
        const sortType = e.target.value;
        setSortBy(sortType);

        let sortedFighters = [...fighters];
        switch (sortType) {
            case 'alphabetical':
                sortedFighters.sort((a, b) => a.LastName.localeCompare(b.LastName));
                break;
            case 'mostWins':
                sortedFighters.sort((a, b) => b.Wins - a.Wins);
                break;
            case 'mostLosses':
                sortedFighters.sort((a, b) => b.Losses - a.Losses);
                break;
            default:
                break;
        }

        setFilteredFighters(sortedFighters);
    };

    return (
        <div>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search fighters"
            />
            <button onClick={handleSearch}>Search</button>

            <select value={sortBy} onChange={handleSort}>
                <option value="">Sort by</option>
                <option value="alphabetical">Alphabetical</option>
                <option value="mostWins">Most Wins</option>
                <option value="mostLosses">Most Losses</option>
            </select>

            <div className="fighter-list">
                {filteredFighters.map((fighter) => (
                    <FighterCard key={fighter.FighterId} fighter={fighter} />
                ))}
            </div>
        </div>
    );
}

export default FighterList;
