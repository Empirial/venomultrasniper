import requests
import hashlib
import os
from datetime import datetime, timedelta

# Load configuration from environment variables
MERCHANT_ID = os.getenv('PAYFAST_MERCHANT_ID', '26680461')
MERCHANT_KEY = os.getenv('PAYFAST_MERCHANT_KEY', 'fhhq8nrh72vos')
PASS_PHRASE = os.getenv('PAYFAST_PASS_PHRASE', 'Venomultrasniper1.0')

# PayFast API URLs
BASE_URL = 'https://api.payfast.co.za'
TRANSACTION_HISTORY_URL = f'{BASE_URL}/transactions/history'

def generate_signature(data, passphrase):
    # Create a string of the data sorted by key
    signature_string = '&'.join([f'{key}={value}' for key, value in sorted(data.items())])
    # Append the passphrase
    signature_string += f'&passphrase={passphrase}'
    # Generate the signature using MD5
    return hashlib.md5(signature_string.encode()).hexdigest()

def get_payments():
    # Define the date range for the transaction history
    from_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    to_date = datetime.now().strftime('%Y-%m-%d')

    data = {
        'merchant_id': MERCHANT_ID,
        'merchant_key': MERCHANT_KEY,
        'from_date': from_date,
        'to_date': to_date,
    }
    signature = generate_signature(data, PASS_PHRASE)
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'merchant-id': MERCHANT_ID,
        'merchant-key': MERCHANT_KEY,
        'signature': signature,
    }

    try:
        response = requests.get(TRANSACTION_HISTORY_URL, headers=headers, params=data)
        
        print(f"Response Status Code: {response.status_code}")
        print(f"Response Text: {response.text}")
        
        if response.status_code == 200:
            payments = response.json()
            if 'data' in payments and payments['data']:
                for payment in payments['data']:
                    if payment['status'] == 'COMPLETE':  # Adjust based on PayFast's payment status
                        print(f"Payment ID: {payment['id']}, Status: {payment['status']}")
            else:
                print("No payments found.")
        else:
            print(f"Failed to retrieve payments: {response.status_code} - {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    get_payments()
