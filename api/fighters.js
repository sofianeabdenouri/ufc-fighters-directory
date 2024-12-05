import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        console.log('Fetching fighters...');
        try {
            const response = await fetch(
                `https://api.sportsdata.io/v3/mma/scores/json/FightersBasic?key=${process.env.VITE_API_KEY}`
            );

            if (!response.ok) {
                const responseBody = await response.text(); // Log response for debugging
                console.error('Error fetching fighters:', response.statusText, responseBody);
                throw new Error(`Failed to fetch fighters: ${response.statusText}`);
            }

            const fighters = await response.json();
            console.log('Fighters fetched successfully');
            res.status(200).json(fighters);
        } catch (error) {
            console.error('Error fetching fighters:', error.message);
            res.status(500).json({ error: 'Failed to fetch fighters' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
