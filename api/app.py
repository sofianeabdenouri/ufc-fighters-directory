from flask import Flask, jsonify
from flask_cors import CORS  # Import Flask-CORS
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for the entire app

@app.route('/fighters', methods=['GET'])
def get_fighters():
    url = "https://api.sportsdata.io/v3/mma/scores/json/FightersBasic"
    headers = {
        'Ocp-Apim-Subscription-Key': '367273178ae34553a6df1f7b5b76089e'
    }

    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        return jsonify({"error": "Failed to retrieve UFC data"}), response.status_code

    fighters = response.json()

    fighter_data = []
    for fighter in fighters:
        # Ensure first_name and last_name are never None by using str()
        first_name = str(fighter.get('FirstName', ""))
        last_name = str(fighter.get('LastName', ""))
        weight_class = fighter.get('WeightClass', "Unknown")
        wins = fighter.get('Wins', 0)
        losses = fighter.get('Losses', 0)
        draws = fighter.get('Draws', 0)
        # Assuming there's a field for the fighter's image URL, like 'ImageUrl'
        image_url = fighter.get('ImageUrl', '')

        fighter_data.append({
            'name': f"{first_name} {last_name}".strip(),  # Avoid extra spaces if one of them is empty
            'weight_class': weight_class,
            'record': f"{wins} - {losses} - {draws}",
            'fighter_id': fighter.get('FighterId', 0),
            'image_url': image_url  # Add image_url field if it exists
        })

    return jsonify(fighter_data)

if __name__ == '__main__':
    app.run(debug=True)
