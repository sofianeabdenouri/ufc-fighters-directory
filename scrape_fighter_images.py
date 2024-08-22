import wikipediaapi
import requests
import os
import json
from bs4 import BeautifulSoup  # You need to install BeautifulSoup4 if you haven't

# Define the user agent
USER_AGENT = "UFC-Fighter-Image-Scraper/1.0 (sofianeabdenouri@example.com)"

# Initialize Wikipedia API with English language and custom user agent
wiki_wiki = wikipediaapi.Wikipedia(
    language='en',
    user_agent=USER_AGENT
)

# Directory to save images
IMAGE_DIR = "src/assets/fighter_images/"
os.makedirs(IMAGE_DIR, exist_ok=True)

# URL to get fighter data from your API
API_URL = "http://127.0.0.1:5000/fighters"

# Fetch fighter data from the API
response = requests.get(API_URL)
if response.status_code != 200:
    print(f"Failed to retrieve fighter data: {response.status_code}")
    exit()

fighters_data = response.json()  # This should be a list of fighters

for fighter in fighters_data:
    # Construct the fighter's name using the first name and last name
    fighter_name = fighter['name']
    
    # Search for the Wikipedia page for the fighter
    wiki_page = wiki_wiki.page(fighter_name)

    if wiki_page.exists():
        print(f"Found Wikipedia page for {fighter_name}")
        try:
            # Download the Wikipedia page content
            wiki_response = requests.get(wiki_page.fullurl, headers={'User-Agent': USER_AGENT})
            soup = BeautifulSoup(wiki_response.content, 'html.parser')
            
            # Find the first image in the infobox (most likely the fighter's photo)
            image_tag = soup.find('table', {'class': 'infobox'}).find('img')
            if image_tag:
                img_url = 'https:' + image_tag['src']
                
                # Download the image
                img_response = requests.get(img_url, headers={'User-Agent': USER_AGENT})
                if img_response.status_code == 200:
                    img_path = os.path.join(IMAGE_DIR, f"{fighter_name.replace(' ', '_')}.jpg")
                    with open(img_path, 'wb') as img_file:
                        img_file.write(img_response.content)
                    print(f"Saved {img_path}")
                else:
                    print(f"Failed to download image for {fighter_name}")
            else:
                print(f"No image found for {fighter_name}")
                
        except Exception as e:
            print(f"Error downloading image for {fighter_name}: {str(e)}")
    else:
        print(f"Wikipedia page not found for {fighter_name}")
