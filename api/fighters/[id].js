import fetch from 'node-fetch';

export default async function handler(req, res) {
    const { id } = req.query; // Get fighter ID from the request
    console.log(`Fetching fighter by ID: ${id}`);

    if (req.method === 'GET') {
        try {
            const response = await fetch(
                `https://api.sportsdata.io/v3/mma/scores/json/Fighter/${id}?key=${process.env.VITE_API_KEY}`
            );

            if (!response.ok) {
                const responseBody = await response.text(); // Log response for debugging
                console.error(`Error fetching fighter ID ${id}:`, response.statusText, responseBody);
                throw new Error(`Failed to fetch fighter ID ${id}: ${response.statusText}`);
            }

            const fighter = await response.json();
            console.log(`Fighter ${id} fetched successfully`);
            res.status(200).json(fighter);
        } catch (error) {
            console.error(`Error fetching fighter ID ${id}:`, error.message);
            res.status(500).json({ error: `Failed to fetch fighter ID ${id}` });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
