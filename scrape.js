import puppeteer from 'puppeteer';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import stream from 'stream';
import { fileURLToPath } from 'url';

// Manual workaround for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Your API key
const apiKey = '367273178ae34553a6df1f7b5b76089e'; 

// Fetch fighter names from your API
async function getFighters() {
    const response = await fetch(`https://api.sportsdata.io/v3/mma/scores/json/FightersBasic?key=${apiKey}`);
    
    if (!response.ok) {
        console.error('Failed to fetch fighters:', response.statusText);
        return [];
    }

    const data = await response.json();
    
    // Check if the response is an array and map over it
    if (Array.isArray(data)) {
        return data.map(fighter => `${fighter.FirstName} ${fighter.LastName}`);
    } else {
        console.error('Invalid response format. Expected an array.');
        return [];
    }
}

// Scrape fighter image from Google Images with enhanced query and filter out irrelevant images
async function scrapeFighterImage(fighterName) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Modify the query to be more specific to UFC fighter profile photos
    const query = `${fighterName} UFC fighter profile photo`;
    const searchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
    await page.goto(searchUrl);

    await page.waitForSelector('img');

    // Get the first few image URLs to find the best one
    const imageUrls = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images
            .map(img => img.src)
            .filter(src => src && !src.includes('doodles') && !src.includes('logos') && !src.includes('default')); // Filter out irrelevant images
    });

    await browser.close();
    return imageUrls.length > 0 ? imageUrls[0] : ''; // Return the first valid image or an empty string
}

// Function to download the image
const downloadImage = async (url, fighterName) => {
    const imagePath = path.resolve(__dirname, 'images', `${fighterName.replace(/ /g, '_')}.jpg`);
    const response = await fetch(url);
    const writeStream = fs.createWriteStream(imagePath);
    await promisify(stream.pipeline)(response.body, writeStream);
    console.log(`Downloaded image for ${fighterName}`);
}

// Helper function to add a delay between requests
const delay = ms => new Promise(res => setTimeout(res, ms));

// Scrape images for multiple fighters dynamically, download them, and save URLs
async function scrapeImagesForAllFighters() {
    const fighters = await getFighters();
    const imageUrls = {};

    // Ensure that the 'images' folder exists
    const dir = path.resolve(__dirname, 'images');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    for (const name of fighters) {
        try {
            console.log(`Fetching image for ${name}...`);
            const imageUrl = await scrapeFighterImage(name);
            if (imageUrl) {
                imageUrls[name] = imageUrl;
                await downloadImage(imageUrl, name);  // Download the image
                console.log(`Image for ${name}: ${imageUrl}`);
            } else {
                console.log(`No image found for ${name}`);
            }

            // Delay before processing the next fighter
            await delay(2000); // 2-second delay between each request

        } catch (error) {
            console.error(`Error fetching image for ${name}:`, error);
        }
    }

    // Save the URLs to a JSON file
    fs.writeFileSync('fighter-images.json', JSON.stringify(imageUrls, null, 2));
    console.log('Image URLs saved to fighter-images.json');
}

scrapeImagesForAllFighters();
